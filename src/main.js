const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const dbPath = path.join(app.getPath("userData"), "Database.db");
const { supabase } = require("../src/backend/supabaseClient.js");

let win;
let user = {};

const db = new Database(dbPath);
console.log(`Data base creada en ${dbPath}`);

//Creacion de tablas + habilitar claves foraneas
db.pragma("foreign_keys = ON");
db.exec(`
    CREATE TABLE IF NOT EXISTS producto(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        cod_barra TEXT NOT NULL UNIQUE,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT NULL DEFAULT "sin descripcion",
        precio_compra INTEGER NOT NULL,
        precio_venta INTEGER NOT NULL,
        marca TEXT NOT NULL,
        categoria TEXT NOT NULL,
        stock_actual INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS venta(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        venta_total INTEGER NOT NULL,
        metodo_pago TEXT NOT NULL,
        fecha TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
        descuento_venta INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS detalle_venta(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        cantidad INTEGER NOT NULL,
        precio INTEGER NOT NULL,
        descuento_prod INTEGER NOT NULL,
        venta_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        FOREIGN KEY (venta_id) REFERENCES venta(id)
            ON DELETE CASCADE 
            ON UPDATE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES producto(id)
            ON DELETE RESTRICT
            ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS movimiento(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL,
        fecha TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
        total INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS detalle_movimiento(
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    mov_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_compra INTEGER NOT NULL,
    precio_venta INTEGER NOT NULL,
    FOREIGN KEY (mov_id) REFERENCES movimiento(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES producto(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
    );
    `);

//Funciones De la app
const guardarMovimiento = db.transaction((datosMovimiento) => {
    let productos = datosMovimiento[0];
    let total = datosMovimiento[1];

    const stmtMovimiento = db.prepare(
        "INSERT INTO movimiento (tipo, total) VALUES (?,?)",
    );
    const resultadoMovimiento = stmtMovimiento.run("tipo", total);
    const idUltMovimiento = resultadoMovimiento.lastInsertRowid;
    console.log(idUltMovimiento);

    const stmtDetalle = db.prepare(
        "INSERT INTO detalle_movimiento (mov_id, cantidad, precio_compra, precio_venta) VALUES (?,?,?,?)",
    );
    for (let p of productos) {
        stmtDetalle.run(
            idUltMovimiento,
            p.cantidad,
            p.precioCompra,
            p.precioVenta,
        );
    }
});

//Func para cargar prods de prueba
const testCargarProds = () => {
    const stmtcrgProd = db.prepare(
        "INSERT INTO producto (cod_barra, nombre, descripcion, precio_compra, precio_venta, marca, categoria, stock_actual) VALUES (?,?,?,?,?,?,?,?)",
    );

    const testProductos = [
        {
            cod_barra: "7791234567890",
            nombre: "Coca Cola 2.25L",
            descripcion: "Gaseosa sabor cola de 2.25 litros",
            precio_compra: 1800,
            precio_venta: 2500,
            marca: "Coca-Cola",
            categoria: "Bebidas",
            stock_actual: 20,
        },
        {
            cod_barra: "7791234567891",
            nombre: "Arroz Gallo 1kg",
            descripcion: "Arroz blanco largo fino de 1 kg",
            precio_compra: 1200,
            precio_venta: 1800,
            marca: "Gallo",
            categoria: "Almacén",
            stock_actual: 35,
        },
        {
            cod_barra: "7791234567892",
            nombre: "Aceite Natura 900ml",
            descripcion: "Aceite de girasol de 900 ml",
            precio_compra: 2200,
            precio_venta: 3000,
            marca: "Natura",
            categoria: "Almacén",
            stock_actual: 15,
        },
    ];

    for (const p of testProductos) {
        stmtcrgProd.run(
            p.cod_barra,
            p.nombre,
            p.descripcion,
            p.precio_compra,
            p.precio_venta,
            p.marca,
            p.categoria,
            p.stock_actual,
        );
    }
};

//Pedir nombre de productos Sugerencia de buscado
const pedirDatosDeProductos = (
    parametroDeBusqueda,
    valorDeBusqueda,
    datosRequeridos,
) => {
    const stmtPedirProductos = db.prepare(
        `SELECT ${datosRequeridos} FROM producto WHERE ${parametroDeBusqueda} LIKE '${valorDeBusqueda}%' LIMIT 5`,
    );

    const resultado = stmtPedirProductos.all();
    return resultado;
};

//Funcion que crea la ventana de vista
const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "./preload.js"),
        },
    });

    win.loadFile(path.join(__dirname, "pages", "login", "login.html"));
};
//Probar conexion Bd
const probarConexionSupabase = async () => {
    const { data, error } = await supabase
        .from("comercio")
        .select("*")
        .limit(1);

    if (error) {
        console.log("Error database:\n", error);
    } else {
        console.log(data);
    }
};

const verificarCredenciales = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            throw new Error(error);
        }
        user = { userId: data.user.id };
        return { ok: true };
    } catch (e) {
        return { ok: false, message: e.message };
    }
};

//Funciones para cuando este lista la app

app.whenReady().then(() => {
    createWindow();
    let count = 0; //Contador parte de la logica para eliminar movimientos a las 3 inserciones

    ipcMain.handle("loginUser", async (e, datosLogin) => {
        try {
            const respuesta = await verificarCredenciales(
                datosLogin.email,
                datosLogin.password,
            );
            if (respuesta.ok) {
                win.loadFile(
                    path.join(
                        __dirname,
                        "pages",
                        "movimientos",
                        "movimientos.html",
                    ),
                );
            }
            return respuesta;
        } catch (e) {
            console.log(e.message);
        }
    });

    ipcMain.on("cargarProdsPrueba", () => {
        const tablaProds = db.prepare("SELECT * FROM producto");
        if (tablaProds.lenght == 0) {
            testCargarProds();
            console.log("Se cargaron 3 prods");
        }
        console.log("Productos\n", tablaProds.all());
    });

    //Logica para pedir producto, que ayuda a verificar si ya esta cargado o no
    ipcMain.handle("pedirNombreProductos", async (e, nombreProducto) => {
        try {
            if (nombreProducto != "") {
                let productosSugeridos = pedirDatosDeProductos(
                    "nombre",
                    nombreProducto,
                    "id, nombre",
                );
                return productosSugeridos;
            }
        } catch (e) {
            console.log(e.message);
        }
    });

    ipcMain.handle("pedirDatosProducto", (e, idProducto) => {
        try {
            if (idProducto) {
                let producto = pedirDatosDeProductos("id", idProducto, "*");
                return producto[0];
            }
        } catch (e) {
            console.log(e.message);
        }
    });

    //Logica para recibir el movimiento, guardarlo y devolver un true
    ipcMain.handle("guardarMovimiento", async (e, datosMovimiento) => {
        try {
            console.log("Datos del movimiento:\n", datosMovimiento);

            guardarMovimiento(datosMovimiento);

            //Logica para ver tabla de movimientos y borrarla a las 3 inserciones, UNICAMENTE PARA TESTEO.
            const tablaMovimientos = db.prepare("SELECT * FROM movimiento");
            const borrarMovimientos = db.prepare("DELETE FROM movimiento");
            const reiniciarIdsMovimientos = db.prepare(
                "DELETE FROM sqlite_sequence WHERE name='movimiento'",
            );

            let resultado = tablaMovimientos.all();
            console.log("Tabla antes de eliminar:\n", resultado);

            count++;
            if (count % 3 == 0) {
                borrarMovimientos.run();
                reiniciarIdsMovimientos.run();
                resultado = tablaMovimientos.all();
                console.log("Tabla despues de eliminar:\n", resultado);
            }

            //Return si todo salio bien
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    });
});
