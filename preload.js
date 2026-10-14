const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dbApi", {
    guardarMovimiento: async (movimiento) => {
        return await ipcRenderer.invoke("guardarMovimiento", movimiento);
    },
});
