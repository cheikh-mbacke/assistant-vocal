const { app } = require("electron/main");
const { createWindow } = require("./window");
const { setupIPC } = require("./ipc");

// Initialize the application when Electron is ready
app.whenReady().then(() => {
  // Create the main application window
  createWindow();

  // Setup Inter-Process Communication
  setupIPC();

  // macOS specific behavior: recreate window when dock icon is clicked and no windows are open
  app.on("activate", () => {
    // Check if no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(); // Create a new window
    }
  });
});

// Handle window closure events
app.on("window-all-closed", () => {
  // Quit the application when all windows are closed, except on macOS
  if (process.platform !== "darwin") {
    app.quit();
  }
  // On macOS, the application stays active until the user explicitly quits
});
