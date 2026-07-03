import { Navigation } from 'react-native-navigation'

let launched = false
const handlers: Array<() => void> = []

const runAsync = (handler: () => void) => {
  if (typeof setImmediate == 'function') setImmediate(handler)
  else setTimeout(handler, 0)
}

export const listenLaunchEvent = () => {
  Navigation.events().registerAppLaunchedListener(() => {
    // console.log('Register app launched listener', launched)
    launched = true
    runAsync(() => {
      for (const handler of handlers) handler()
    })
  })
}

export const onAppLaunched = (handler: () => void) => {
  handlers.push(handler)
  if (launched) {
    runAsync(() => {
      handler()
    })
  }
}
