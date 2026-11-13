const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dbApi", {
    loginUser: async (datosLogin) => {
        return await ipcRenderer.invoke("loginUser", datosLogin);
    },

    cargar3Prods: () => {
        ipcRenderer.send("cargarProdsPrueba");
    },

    guardarMovimiento: async (movimiento) => {
        return await ipcRenderer.invoke("guardarMovimiento", movimiento);
    },

    pedirNombreProductos: async (nombreProducto) => {
        return await ipcRenderer.invoke("pedirNombreProductos", nombreProducto);
    },

    pedirDatosProducto: async (idProducto) => {
        return await ipcRenderer.invoke("pedirDatosProducto", idProducto);
    },
});
