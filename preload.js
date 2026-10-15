const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dbApi", {
    cargar3Prods: () => {
        ipcRenderer.send("cargarProdsPrueba");
    },

    guardarMovimiento: async (movimiento) => {
        return await ipcRenderer.invoke("guardarMovimiento", movimiento);
    },

    pedirProductos: async (nombreProducto) => {
        return await ipcRenderer.invoke("pedirProductos", nombreProducto);
    },
});
