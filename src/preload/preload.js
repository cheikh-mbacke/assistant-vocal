const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
  },
  audio: {
    processAudio: (audioData) => ipcRenderer.invoke("process-audio", audioData),
  },
  files: {
    writeTempFile: (data) => ipcRenderer.invoke("write-temp-file", data),
    deleteTempFile: (filePath) =>
      ipcRenderer.invoke("delete-temp-file", filePath),
  },
});
