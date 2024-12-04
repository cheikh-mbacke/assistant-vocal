export class UIControls {
  /**
   * Initialize UI controls for audio recording
   * @param {AudioRecorder} audioRecorder - Instance of audio recorder
   */
  constructor(audioRecorder) {
    this.audioRecorder = audioRecorder;
    this.speakButton = document.getElementById("speak-button");
    this.statusText = document.getElementById("status");

    // SVG icon for microphone button
    this.microphoneIcon = `
      <svg class="w-8 h-8" fill="none" stroke="white" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    `;

    // Apply Tailwind CSS classes for button styling
    this.speakButton.classList.add(
      // Dimensions and shape
      "w-16",
      "h-16",
      "rounded-full",
      // Flexbox alignment
      "flex",
      "items-center",
      "justify-center",
      // Transitions
      "transition-colors",
      "duration-200",
      // Focus states
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-indigo-500",
      "focus:ring-offset-2",
      // Colors
      "bg-indigo-600",
      "hover:bg-indigo-700"
    );

    this.setupEventListeners();
  }

  /**
   * Set up click event listener for the speak button
   */
  setupEventListeners() {
    this.speakButton.addEventListener("click", () => {
      if (!this.audioRecorder.isListening) {
        this.startRecording();
      } else {
        this.stopRecording();
      }
    });
  }

  /**
   * Start recording and update UI state
   */
  startRecording() {
    this.audioRecorder.start();
    this.updateUI("recording");
  }

  /**
   * Stop recording and update UI state
   */
  stopRecording() {
    this.audioRecorder.stop();
    this.updateUI("stopped");
  }

  /**
   * Update UI elements based on current state
   * @param {string} state - Current UI state ("recording", "stopped", etc.)
   * @param {string} message - Optional message to display
   */
  updateUI(state, message = "") {
    // Reset color classes
    this.speakButton.classList.remove(
      "bg-indigo-600",
      "hover:bg-indigo-700",
      "bg-red-500",
      "hover:bg-red-600"
    );

    // Update UI based on state
    switch (state) {
      case "recording":
        this.statusText.textContent = "Microphone activé. Parlez maintenant...";
        this.speakButton.classList.add("bg-red-500", "hover:bg-red-600");
        break;

      case "stopped":
        this.statusText.textContent = "Enregistrement terminé.";
        this.speakButton.classList.add("bg-indigo-600", "hover:bg-indigo-700");
        break;

      case "processing":
        this.statusText.textContent = "Traitement de la commande...";
        this.speakButton.classList.add("bg-indigo-600", "hover:bg-indigo-700");
        break;

      case "success":
        this.statusText.textContent = message;
        this.speakButton.classList.add("bg-indigo-600", "hover:bg-indigo-700");
        break;

      case "error":
        this.statusText.textContent = `Erreur : ${message}`;
        this.speakButton.classList.add("bg-indigo-600", "hover:bg-indigo-700");
        break;

      default:
        this.statusText.textContent = "Prêt";
        this.speakButton.classList.add("bg-indigo-600", "hover:bg-indigo-700");
    }

    // Update button icon
    this.speakButton.innerHTML = this.microphoneIcon;
  }
}
