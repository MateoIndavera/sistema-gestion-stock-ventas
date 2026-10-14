const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(app.getPath("userData"), "Database.db");

const db = new Database(dbPath);
console.log(`Data base creada en ${dbPath}`);

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS producto(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        cod_barra TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL  UNIQUE,
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

const guardarMovimiento = db.transaction((datosMovimiento) => {
    let productos = datosMovimiento[0];
    let total = datosMovimiento[1];

    const stmtMovimiento = db.prepare(
        "INSERT INTO movimiento (tipo, total) VALUES (?,?)",
    );
    const resultadoMovimiento = stmtMovimiento.run("tipo", total);
    const idUltMovimiento = resultadoMovimiento.lastInsertRowid;

    const stmtDetalle = db.prepare(
        "INSERT INTO detalle_movimiento (mov_id, cantidad, precio_compra, precio_venta) VALUES (?,?,?,?)",
    );
    for (let p of productos) {
        console.log(idUltMovimiento);
        console.log(p.cantidad);
        console.log(p.precioCompra);
        console.log(p.precioVenta);
        stmtDetalle.run(
            idUltMovimiento,
            p.cantidad,
            p.precioCompra,
            p.precioVenta,
        );
    }
});

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "/preload.js"),
        },
    });

    win.loadFile("./src/views/movimientos.html");
};

app.whenReady().then(() => {
    createWindow();
    let count = 0;
    ipcMain.handle("guardarMovimiento", async (e, datosMovimiento) => {
        try {
            console.log(datosMovimiento);

            guardarMovimiento(datosMovimiento);

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
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    });
});
