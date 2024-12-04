export class AudioRecorder {
  constructor(visualizer) {
    this.audioStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isListening = false;
    this.visualizer = visualizer;
  }

  async start() {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000, // Whisper préfère 16kHz
        },
      });

      this.visualizer.connectStream(this.audioStream);

      // Trouver le bon format audio supporté
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=pcm")
        ? "audio/webm;codecs=pcm"
        : "audio/webm";

      console.log("Using MIME type:", mimeType);

      this.mediaRecorder = new MediaRecorder(this.audioStream, {
        mimeType: mimeType,
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = async () => {
        // On garde le type original pour la création du blob
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });

        // On convertit en WAV si nécessaire
        const wavBlob = await this.convertToWav(audioBlob);

        this.visualizer.stop();
        this.onRecordingComplete(wavBlob);
      };

      this.mediaRecorder.start();
      this.isListening = true;
    } catch (error) {
      throw new Error(`Microphone error: ${error.message}`);
    }
  }

  async convertToWav(blob) {
    // Créer un contexte audio avec la fréquence souhaitée
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(
      {
        sampleRate: 16000, // Force 16 kHz
      }
    );

    // Convertir le blob en ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();

    // Décoder l'audio
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Créer un buffer de destination à 16 kHz
    const offlineContext = new OfflineAudioContext({
      numberOfChannels: 1, // Mono
      length: Math.ceil(audioBuffer.duration * 16000),
      sampleRate: 16000,
    });

    // Créer la source
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start();

    // Rendre et convertir
    const renderedBuffer = await offlineContext.startRendering();

    // Convertir en WAV
    const wavBuffer = this.audioBufferToWav(renderedBuffer);

    return new Blob([wavBuffer], { type: "audio/wav" });
  }

  audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const dataLength = buffer.length * numChannels * (bitDepth / 8);
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const wav = new ArrayBuffer(totalLength);
    const view = new DataView(wav);

    // WAV Header
    writeString(view, 0, "RIFF"); // RIFF identifier
    view.setUint32(4, 36 + dataLength, true); // file length minus RIFF identifier length and file description length
    writeString(view, 8, "WAVE"); // WAVE identifier
    writeString(view, 12, "fmt "); // format chunk identifier
    view.setUint32(16, 16, true); // format chunk length
    view.setUint16(20, format, true); // sample format (raw)
    view.setUint16(22, numChannels, true); // channel count
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // byte rate
    view.setUint16(32, numChannels * (bitDepth / 8), true); // block align
    view.setUint16(34, bitDepth, true); // bits per sample
    writeString(view, 36, "data"); // data chunk identifier
    view.setUint32(40, dataLength, true); // data chunk length

    // Write audio data
    floatTo16BitPCM(view, headerLength, buffer);

    return wav;
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
    }
    this.isListening = false;
  }

  onRecordingComplete(audioBlob) {
    // To be implemented by consumer
  }
}

// Fonctions utilitaires
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(view, offset, buffer) {
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    const channel = buffer.getChannelData(i);
    for (let j = 0; j < channel.length; j++) {
      const pos = offset + (j * buffer.numberOfChannels + i) * 2;
      const val = Math.max(-1, Math.min(1, channel[j]));
      view.setInt16(pos, val * 0x7fff, true);
    }
  }
}
