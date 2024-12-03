export class AudioVisualizer {
  /**
   * Initialize the AudioVisualizer with a canvas element
   * @param {HTMLCanvasElement} canvas - The canvas for visualization
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.startTime = 0; // Recording start timestamp
    this.rafId = null; // RequestAnimationFrame ID

    // Set canvas dimensions to match its display size
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  /**
   * Initialize or resume the audio context
   * Sets up the audio analyzer and its configuration
   */
  async initialize() {
    if (!this.isInitialized) {
      // Create audio context with browser compatibility
      this.audioContext = new (window.AudioContext ||
        window.AudioContext)();
      this.analyser = this.audioContext.createAnalyser();

      // Configure analyzer node
      this.analyser.fftSize = 2048; // Size of FFT (determines resolution)
      this.analyser.smoothingTimeConstant = 0.8; // Smoothing factor for visualization
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isInitialized = true;
    } else if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  /**
   * Calculate decibel value from raw audio data
   * @param {number} value - Raw audio value (0-255)
   * @returns {number} - Decibel value
   */
  calculateDB(value) {
    return Math.round(20 * Math.log10(value / 255));
  }

  /**
   * Draw the audio waveform on the canvas
   * Uses requestAnimationFrame for smooth animation
   */
  draw() {
    if (!this.isInitialized) return;

    this.rafId = requestAnimationFrame(() => this.draw());

    const width = this.canvas.width;
    const height = this.canvas.height;

    // Clear canvas
    this.canvasCtx.fillStyle = "#ffffff";
    this.canvasCtx.fillRect(0, 0, width, height);

    // Get current audio data
    this.analyser.getByteTimeDomainData(this.dataArray);

    // Set drawing style
    this.canvasCtx.lineWidth = 2;
    this.canvasCtx.strokeStyle = "#4F46E5"; // Indigo color
    this.canvasCtx.beginPath();

    // Calculate width for each data point
    const sliceWidth = width / this.analyser.frequencyBinCount;
    let x = 0;

    // Draw waveform
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      const v = this.dataArray[i] / 128.0; // Normalize to [-1, 1]
      const y = (v * height) / 2; // Scale to canvas height

      if (i === 0) {
        this.canvasCtx.moveTo(x, y);
      } else {
        this.canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.canvasCtx.stroke();
  }

  /**
   * Calculate average volume from frequency data
   * @returns {number} - Average volume (0-255)
   */
  getAverageVolume() {
    if (!this.isInitialized) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    return sum / this.dataArray.length;
  }

  /**
   * Connect an audio stream to the visualizer
   * @param {MediaStream} stream - The audio stream to visualize
   */
  async connectStream(stream) {
    await this.initialize();

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.startTime = Date.now();
    this.draw();
  }

  /**
   * Stop the visualization and clean up resources
   */
  async stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.audioContext && this.audioContext.state === "running") {
      await this.audioContext.suspend();
    }

    // Clear the canvas
    this.canvasCtx.fillStyle = "#ffffff";
    this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
