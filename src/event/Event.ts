// import mitt from 'mitt'
// import type { Emitter } from 'mitt'

export default class Event {
  listeners: Map<string, Array<(...args: any[]) => any>>
  constructor() {
    this.listeners = new Map()
  }

  on(eventName: string, listener: (...args: any[]) => any) {
    let targetListeners = this.listeners.get(eventName)
    if (!targetListeners) this.listeners.set(eventName, targetListeners = [])
    targetListeners.push(listener)
  }

  off(eventName: string, listener: (...args: any[]) => any) {
    let targetListeners = this.listeners.get(eventName)
    if (!targetListeners) return
    const index = targetListeners.indexOf(listener)
    if (index < 0) return
    targetListeners.splice(index, 1)
  }

  emit(eventName: string, ...args: any[]) {
    const run = () => {
      let targetListeners = this.listeners.get(eventName)
      if (!targetListeners) return
      for (const listener of targetListeners) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        listener(...args)
      }
    }
    // iOS/Hermes 某些构建里没有 setImmediate，直接调用会导致
    // “undefined is not a function”，表现为点击顶部“歌曲/歌单”等按钮弹崩溃框。
    if (typeof setImmediate == 'function') setImmediate(run)
    else setTimeout(run, 0)
  }

  offAll(eventName: string) {
    let targetListeners = this.listeners.get(eventName)
    if (!targetListeners) return
    this.listeners.delete(eventName)
  }
}

// export class App_EVENT {
//   listeners: Map<string, Array<() => void>>
//   constructor() {
//     this.listeners = new Map()
//   }

//   on(eventName: string, listener: () => void) {
//     let targetListeners = this.listeners.get(eventName)
//     if (targetListeners) this.listeners.set(eventName, targetListeners = [])
//     targetListeners!.push(listener)
//   }

//   off(eventName: string, listener: () => void) {

//   }
// }
