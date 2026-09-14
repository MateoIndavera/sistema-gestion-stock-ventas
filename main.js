const { app, BrowserWindow } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(app.getPath("userData"), "Database.db");

const db = new Database(dbPath);
console.log(`Data base creada en ${dbPath}`);

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "/preload.js"),
        },
    });

    win.loadFile("./src/index.html");
};

app.whenReady().then(() => {
    createWindow();
});
