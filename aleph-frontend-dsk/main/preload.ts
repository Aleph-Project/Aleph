import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const handler = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value)
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)

    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
  async invoke(channel: string, ...args: unknown[]){
    const validChannels = ['store-auth-token', 'get-auth-token', 'clear-auth-token', 'auth:login', 'auth:logout', 'auth:register', 'auth:activate-account', 'auth:request-reset-code', 'auth:verify-reset-code', 'auth:reset-password', 'auth:token-is-valid', 'auth:refresh-token', 'auth0-login', 'auth0-logout', 'auth0-refresh-token', 'auth0:refresh-token', 'get-auth0-config', 'get-refresh-token', 'clear-refresh-token', 'message']
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error(`Channel "${channel}" is not valid`))
  }
}

contextBridge.exposeInMainWorld('ipc', handler)

export type IpcHandler = typeof handler
