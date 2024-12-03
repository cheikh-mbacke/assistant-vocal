const { BrowserWindow } = require("electron/main"); 
const path = require("path");

/**
 * Creates and configures the main application window
 * @returns {BrowserWindow} The configured browser window instance
 */
function createWindow() {
  // Create a new browser window instance with specific configurations
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Security-related preferences
      nodeIntegration: false, // Disable Node.js integration in renderer process for security
      contextIsolation: true, // Enable context isolation between main and renderer processes
      preload: path.join(__dirname, "../preload/preload.js"), // Path to preload script
    },
  });

  // Load the main HTML file into the window
  // Using path.join to ensure cross-platform compatibility
  win.loadFile(path.join(__dirname, "../renderer/index.html"));

  // Return the window instance for further manipulation if needed
  return win;
}

module.exports = { createWindow };
