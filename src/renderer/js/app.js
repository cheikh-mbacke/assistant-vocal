
/**
 * Main application file orchestrating audio recording functionality
 */
import { AudioRecorder } from "./audio/recorder.js";
import { AudioPlayer } from "./audio/player.js";
import { AudioVisualizer } from "./audio/visualizer.js";
import { UIControls } from "./ui/controls.js";

class App {
  /**
   * Initialize the application and set up all components
   */
  constructor() {
    // Get the canvas element for visualization
    const canvas = document.getElementById("visualizer");

    // Initialize core components
    this.visualizer = new AudioVisualizer(canvas);
    this.audioRecorder = new AudioRecorder(this.visualizer);
    this.audioPlayer = new AudioPlayer();
    this.uiControls = new UIControls(this.audioRecorder);

    // Set up event handlers
    this.setupRecordingHandlers();
  }

  /**
   * Set up handlers for recording completion
   * Currently handles saving the recorded audio file
   */
  setupRecordingHandlers() {
    this.audioRecorder.onRecordingComplete = async (audioBlob) => {
      try {
        this.uiControls.updateUI("processing", "Transcription en cours...");

        // Correction ici : fs -> files
        const tempPath = await window.api.files.writeTempFile(
          await audioBlob.arrayBuffer()
        );

        const transcription = await window.api.audio.processAudio(tempPath);

        // Correction ici aussi : fs -> files
        await window.api.files.deleteTempFile(tempPath);

        console.log(transcription);
        

        this.uiControls.updateUI("success", transcription);
      } catch (error) {
        console.error("Erreur de traitement:", error);
        this.uiControls.updateUI("error", error.message);
      }
    };
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new App();
});