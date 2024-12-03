export class AudioRecorder {
  /**
   * Initialize the AudioRecorder with a visualizer
   * @param {AudioVisualizer} visualizer - The audio visualizer instance
   */
  constructor(visualizer) {
    this.audioStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isListening = false;
    this.visualizer = visualizer;
  }

  /**
   * Start audio recording
   * Sets up media stream, connects visualizer, and begins recording
   */
  async start() {
    try {
      // Request microphone access and get audio stream
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Connect the audio stream to the visualizer
      this.visualizer.connectStream(this.audioStream);

      // Initialize MediaRecorder with the audio stream
      this.mediaRecorder = new MediaRecorder(this.audioStream);
      this.audioChunks = [];

      // Event handler for receiving audio data
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      // Event handler for when recording stops
      this.mediaRecorder.onstop = () => {
        // Create final audio blob from collected chunks
        const audioBlob = new Blob(this.audioChunks, { type: "audio/wav" });
        this.visualizer.stop();
        this.onRecordingComplete(audioBlob);
      };

      // Start recording
      this.mediaRecorder.start();
      this.isListening = true;
    } catch (error) {
      throw new Error(`Microphone error: ${error.message}`);
    }
  }

  /**
   * Stop audio recording
   * Stops both the media recorder and all audio tracks
   */
  stop() {
    // Stop media recorder if it's recording
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
    }
    // Stop all audio tracks
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
    }
    this.isListening = false;
  }

  /**
   * Callback for when recording is complete
   * To be implemented by the consumer of this class
   * @param {Blob} audioBlob - The complete recorded audio data
   */
  onRecordingComplete(audioBlob) {
    // To be implemented by consumer
  }
}
