const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hunterOverlay', {
  onState: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('overlay:state', listener);
    ipcRenderer.on('control:state', listener);
    return () => {
      ipcRenderer.removeListener('overlay:state', listener);
      ipcRenderer.removeListener('control:state', listener);
    };
  },
  setClickThrough: (value) => ipcRenderer.send('overlay:set-click-through', value),
  setEditMode: (value) => ipcRenderer.send('overlay:set-edit-mode', value),
  setOpacity: (value) => ipcRenderer.send('overlay:set-opacity', value),
  setWidgetVisibility: (widget, visible) => ipcRenderer.send('overlay:set-widget-visibility', { widget, visible }),
  adjustBounds: (delta) => ipcRenderer.send('overlay:adjust-bounds', delta),
  resetSimulation: () => ipcRenderer.send('overlay:reset-simulation'),
  profile: {
    state: () => ipcRenderer.invoke('profile:state'),
    create: (input) => ipcRenderer.invoke('profile:create', input),
    login: (input) => ipcRenderer.invoke('profile:login', input),
    logout: () => ipcRenderer.invoke('profile:logout'),
    update: (input) => ipcRenderer.invoke('profile:update', input),
  },
  onlineBuilds: {
    search: (filters) => ipcRenderer.invoke('builds:online-search', filters),
    mine: () => ipcRenderer.invoke('builds:online-mine'),
    publish: (build) => ipcRenderer.invoke('builds:online-publish', build),
    unpublish: (localBuildId) => ipcRenderer.invoke('builds:online-unpublish', localBuildId),
  },
});
