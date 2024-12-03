const { contextBridge, ipcRenderer } = require("electron");

// Expose specific APIs to the renderer process through the context bridge
contextBridge.exposeInMainWorld("api", {
  // Expose version information
  versions: {
    // Functions to get various runtime versions
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },
});
