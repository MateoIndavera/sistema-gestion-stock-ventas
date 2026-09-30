const { app, BrowserWindow } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(app.getPath("userData"), "Database.db");

const db = new Database(dbPath);
console.log(`Data base creada en ${dbPath}`);

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS producto(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        cod_barra varchar(50) NOT NULL UNIQUE,
        name varchar(200) NOT NULL  UNIQUE,
        descripcion varchar(200) NULL DEFAULT "sin descripcion",
        precio_compra INTEGER NOT NULL,
        precio_venta INTEGER NOT NULL,
        marca varchar(100) NOT NULL,
        categoria varchar(100) NOT NULL,
        stock_actual INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS venta(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        venta_total INTEGER NOT NULL,
        metodo_pago varchar(200) NOT NULL,
        fecha varchar(200) NOT NULL DEFAULT (DATETIME('now', 'localtime')),
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
        tipo varchar(200) NOT NULL,
        fecha varchar(200) NOT NULL DEFAULT (DATETIME('now', 'localtime'))
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

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "/preload.js"),
        },
    });

    win.loadFile("./src/views/ventas.html");
};

app.whenReady().then(() => {
    createWindow();
});
