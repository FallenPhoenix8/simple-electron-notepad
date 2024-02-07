import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import path from "node:path";
import { readFile, writeFile } from "fs";
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │

//Defining menu
const isMac = process.platform === "darwin";

const template: any = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }],
        },
      ]
    : []),
  {
    label: "File",
    submenu: [
      {
        label: "Open File",
        accelerator: "CmdOrCtrl+O",
        click: () => {
          console.log("Opening file...");
          dialog
            .showOpenDialog({
              properties: ["openFile"],
              filters: [{ name: "Any files", extensions: ["*"] }],
            })
            .then((result) => {
              readFile(
                result.filePaths[0],
                { encoding: "utf8" },
                (err, buffer) => {
                  if (err) {
                    console.log(`Error: ${err}`);
                    return;
                  }
                  console.log(`Content: ${buffer}`);
                  win?.webContents.send("test", buffer);
                }
              );
            })
            .catch((err) => console.log(err));
        },
      },
      {
        label: "Save File",
        accelerator: "CmdOrCtrl+S",
        click: () => {
          console.log("Saving file...");
          dialog.showSaveDialog({}).then((out) => {
            let path: any = out.filePath?.toString();

            console.log(out.filePath);
            console.log(textForFile);

            writeFile(path, textForFile, {}, (err) => {
              if (err) console.log(err);
            });
          });
        },
      },
    ],
  },
  {
    label: "Edit",

    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },

      ...(isMac
        ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
          ]
        : [{ role: "delete" }, { type: "separator" }, { role: "selectAll" }]),
    ],
  },
];

module.exports.mainMenu = Menu.buildFromTemplate(template);

process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "notepad.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

//setting menu
Menu.setApplicationMenu(Menu.buildFromTemplate(template));

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let textForFile: string = "";
ipcMain.on("test2", (e, data) => {
  console.log(`Process: ${e.processId}`);
  textForFile = data;
  console.log(`Content: ${textForFile}`);
});

app.whenReady().then(createWindow);
