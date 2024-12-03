export class AudioPlayer {
  /**
   * Initialize the AudioPlayer
   * Creates an audio player instance with no initial audio loaded
   */
  constructor() {
    this.audio = null;
  }

  /**
   * Play an audio blob (used for testing recordings)
   * @param {Blob} audioBlob - The audio data to play
   */
  playAudioBlob(audioBlob) {
    // Create a URL for the audio blob
    const audioUrl = URL.createObjectURL(audioBlob);
    // Create new audio element with the blob URL
    this.audio = new Audio(audioUrl);

    // Attempt to play the audio
    this.audio
      .play()
      .catch((error) => console.error("Playback error:", error))
      .finally(() => {
        // Clean up by revoking the blob URL to free memory
        URL.revokeObjectURL(audioUrl);
      });
  }

  /**
   * Play a confirmation sound
   * Can be used to provide audio feedback for actions
   */
  playConfirmation() {
    // TODO: Add predefined sounds here
    this.audio = new Audio(); // Path to your confirmation sound
    this.audio.play().catch((error) => console.error("Playback error:", error));
  }

  /**
   * Stop any currently playing audio
   * Resets the playback to the beginning
   */
  stop() {
    if (this.audio) {
      this.audio.pause(); 
      this.audio.currentTime = 0; // Reset to beginning
    }
  }
}
