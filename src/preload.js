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
});
