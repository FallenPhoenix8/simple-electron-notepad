"use strict";const n=require("electron");n.contextBridge.exposeInMainWorld("ipcRenderer",i(n.ipcRenderer));function i(e){const o=Object.getPrototypeOf(e);for(const[t,r]of Object.entries(o))Object.prototype.hasOwnProperty.call(e,t)||(typeof r=="function"?e[t]=function(...c){return r.call(e,...c)}:e[t]=r);return e}