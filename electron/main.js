const { app, BrowserWindow } = require('electron');
const path = require('path');

// 移除導致崩潰的 electron-squirrel-startup 檢查
// 因為我們使用的是 NSIS/Portable 打包方式，不需要這段邏輯

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: '園遊會 POS 系統 v3.0',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 為了簡化本地儲存邏輯，這裡開啟 Node 權限
      webSecurity: false       // 允許讀取本地圖片或檔案
    },
    autoHideMenuBar: true, // 隱藏選單列
    show: false // 關鍵：先隱藏，避免閃爍
  });

  // 修正排版問題：
  // 將 maximize() 移至 ready-to-show 事件中。
  // 這樣確保網頁內容已經載入並解析完畢，此時最大化會正確觸發 CSS 的 RWD 重算。
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  // 開發模式與生產模式的切換
  const isDev = !app.isPackaged;

  if (isDev) {
    // 開發時連線到 Vite Server
    mainWindow.loadURL('http://localhost:5173');
    // 開啟開發者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 打包後讀取編譯好的 index.html
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});