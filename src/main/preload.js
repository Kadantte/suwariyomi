const { ipcRenderer } = require('electron');
const { v4 } = require('uuid');
const log = require('electron-log');

log.catchErrors();
log.info('preload.js: started');

const ipcValidChannels = ['fullscreen-toggle', 'open-protocol'];

window.electron = {
  log: log.functions,
  util: {
    downloadImage: (url, payload) => {
      return ipcRenderer.send('download-image', url, payload);
    },
    getSourceFiles: () => {
      return ipcRenderer.sendSync('get-fs-sources');
    },
    getSourceDirectory: () => {
      return ipcRenderer.sendSync('get-sources-path');
    },
    openInBrowser: (url) => {
      ipcRenderer.send('open-in-browser', url);
    },
    getUserDataPath: () => {
      return ipcRenderer.sendSync('get-userdata-path');
    },
    getDownloadsPath: () => {
      return ipcRenderer.sendSync('get-downloads-path');
    },
  },
  reader: {
    getMangaSettings: (sourceID, mangaID) => {
      return ipcRenderer.sendSync('get-manga-settings', sourceID, mangaID);
    },
    setMangaSettings: (sourceID, mangaID, settings) => {
      return ipcRenderer.sendSync(
        'set-manga-settings',
        sourceID,
        mangaID,
        settings
      );
    },
    flush: () => {
      return ipcRenderer.sendSync('flush-manga-settings');
    },
  },
  library: {
    flush: () => {
      ipcRenderer.send('flush-db');
    },
    getSources: () => {
      return ipcRenderer.sendSync('get-sources');
    },
    addMangaToLibrary: (sourceName, mangaId) => {
      ipcRenderer.send('add-manga-to-library', sourceName, mangaId);
    },
    removeMangaFromLibrary: (sourceName, mangaId) => {
      ipcRenderer.send('remove-manga-from-library', sourceName, mangaId);
    },
    getLibraryMangas: (sourceName) => {
      return ipcRenderer.sendSync('get-library-mangas', sourceName);
    },
    addMangaToCache: (sourceName, fullManga) => {
      ipcRenderer.send('add-manga-to-cache', sourceName, fullManga);
    },
    removeMangaFromCache: (sourceName, ...mangaIds) => {
      console.log(mangaIds);
      ipcRenderer.send('remove-manga-from-cache', sourceName, ...mangaIds);
    },
    getCachedManga: (sourceName, mangaId) => {
      return ipcRenderer.sendSync('get-cached-manga', sourceName, mangaId);
    },
    getCachedMangas: (sourceName) => {
      return ipcRenderer.sendSync('get-cached-mangas', sourceName);
    },
    getAllCachedMangas: () => {
      return ipcRenderer.sendSync('get-all-cached-mangas');
    },
  },
  misc: {
    flush: () => {
      ipcRenderer.send('flush-misc');
    },
  },
  read: {
    get: (sourceName) => {
      return ipcRenderer.sendSync('get-read', sourceName);
    },
    set: (
      sourceName,
      chapterId,
      pageCount,
      currentPage,
      lastRead,
      timeElapsed,
      isBookmarked,
      mangaid
    ) => {
      ipcRenderer.send(
        'set-read',
        sourceName,
        chapterId,
        pageCount,
        currentPage,
        lastRead,
        timeElapsed,
        isBookmarked,
        mangaid
      );
    },
    deleteEntry: (sourceName, chapterId) => {
      ipcRenderer.send('delete-read', sourceName, chapterId);
    },
    deleteSource: (sourceName) => {
      ipcRenderer.send('delete-source-read', sourceName);
    },
    flush: () => {
      ipcRenderer.send('flush-read');
    },
  },
  cache: {
    get: (key) => {
      return ipcRenderer.sendSync('get-cache', key);
    },
    set: (key, value) => {
      ipcRenderer.send('set-cache', key, value);
    },
    has: (key) => {
      return ipcRenderer.sendSync('has-cache', key);
    },
    delete: (...keys) => {
      ipcRenderer.sendSync('delete-cache', ...keys);
    },
    flush: () => {
      ipcRenderer.sendSync('flush-cache');
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
      if (ipcValidChannels.includes(channel)) {
        ipcRenderer.on(channel, func);
      }
    },
    off(channel, func) {
      if (ipcValidChannels.includes(channel)) {
        ipcRenderer.off(channel, func);
      }
    },
    once(channel, func) {
      if (ipcValidChannels.includes(channel)) {
        ipcRenderer.once(channel, func);
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
  settings: {
    get(val) {
      return ipcRenderer.sendSync('settings-get', val);
    },
    getAll() {
      return ipcRenderer.sendSync('settings-get-all');
    },
    set(property, val) {
      ipcRenderer.send('settings-set', property, val);
    },
    overwrite(settings) {
      ipcRenderer.send('settings-set-all', settings);
    },
    flush() {
      ipcRenderer.send('settings-flush');
    },
  },
};
