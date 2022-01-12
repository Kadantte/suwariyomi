const { contextBridge, ipcRenderer } = require('electron');
const { v4 } = require('uuid');

contextBridge.exposeInMainWorld('electron', {
  library: {
    getSource: (sourceName) => {
      return ipcRenderer.invoke('get-source', sourceName);
    },
    getSources: () => {
      return ipcRenderer.invoke('get-sources');
    },
    getManga: (sourceName, mangaId) => {
      return ipcRenderer.invoke('get-manga', sourceName, mangaId);
    },
    getMangaByName: (sourceName, mangaName) => {
      return ipcRenderer.invoke('get-manga-by-name', sourceName, mangaName);
    },
    getMangasByAuthor: (sourceName, authorName) => {
      return ipcRenderer.invoke('get-mangas-by-author', sourceName, authorName);
    },
    addManga: (sourceName, manga) => {
      return ipcRenderer.invoke('add-manga', sourceName, manga);
    },
    removeManga: (sourceName, mangaId) => {
      return ipcRenderer.invoke('remove-manga', sourceName, mangaId);
    },
    updateManga: (sourceName, mangaId, replacementMangaItem) => {
      return ipcRenderer.invoke(
        'update-manga',
        sourceName,
        mangaId,
        replacementMangaItem
      );
    },
    getMangas: (sourceName) => {
      return ipcRenderer.invoke('get-mangas', sourceName);
    },
  },
  auth: {
    async generateAuthenticationWindow(windowData, targetLocation) {
      const id = v4();
      return new Promise((resolve) => {
        ipcRenderer.on(
          `oauth-received-${id}`,
          (event, identifier, return_data) => {
            if (identifier === id) {
              ipcRenderer.removeAllListeners(`oauth-received-${id}`);
              if (return_data) resolve(return_data);
              else resolve(false);
            }
          }
        );
        ipcRenderer.send(
          'authentication-window',
          id,
          windowData,
          targetLocation
        );
      });
    },
    async generatePKCE() {
      return ipcRenderer.invoke('generate-pkce');
    },
    checkAuthenticated(specificLogin) {
      const authorizationStore = ipcRenderer.sendSync(
        'electron-store-get',
        'authorization'
      );

      // Iterate through authorizationStore; if any of the values' have both an access_token and an expires_in, return true
      if (specificLogin)
        return (
          authorizationStore[specificLogin].access_token &&
          authorizationStore[specificLogin].expires_in
        );

      const isAuthenticated = Object.keys(authorizationStore).some(
        (key) =>
          authorizationStore[key].access_token &&
          (authorizationStore[key].expires_in
            ? authorizationStore[key].expires_in > Date.now()
            : true) // if there is no expires_in, assume it's valid
      );
      return isAuthenticated;
    },
  },
  ipcRenderer: {
    minimize() {
      ipcRenderer.send('minimize');
    },
    maximize() {
      ipcRenderer.send('maximize');
    },
    exit() {
      ipcRenderer.send('close-application');
    },
    on(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
  store: {
    get(val) {
      return ipcRenderer.sendSync('electron-store-get', val);
    },
    set(property, val) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    flush() {
      ipcRenderer.send('electron-store-flush');
    },
  },
});
