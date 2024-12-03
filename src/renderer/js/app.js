
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
    this.audioRecorder.onRecordingComplete = (audioBlob) => {
      // Create download link for the audio file
      const link = document.createElement("a");
      link.href = URL.createObjectURL(audioBlob);
      link.download = "enregistrement.wav";
      
      // Trigger download
      link.click();
      
      // Clean up the URL object
      URL.revokeObjectURL(link.href);
      
      // Update UI to show success
      this.uiControls.updateUI("success", "Enregistrement téléchargé");
    };
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new App();
});