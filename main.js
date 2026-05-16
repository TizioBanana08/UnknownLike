const{app, BrowserWindow}= require("electron");
function createWindow(){
    const win= new BrowserWindow({
        fullscreen:true,
        autoHideMenuBar: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.loadFile("index.html");
}

app.whenReady().then(createWindow);