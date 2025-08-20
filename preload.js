const { contextBridge, ipcRenderer, desktopCapturer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onUpdateText: (callback) =>
    ipcRenderer.on("update-text", (_, data) => callback(data)),

  hideScreen: (callback) =>
    ipcRenderer.on("hide-screen", callback),

  showScreen: (callback) =>
    ipcRenderer.on("show-screen", callback),
});

