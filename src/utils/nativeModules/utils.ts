import { AppState, BackHandler, Dimensions, NativeEventEmitter, NativeModules, Platform, Share } from 'react-native'

const { UtilsModule } = NativeModules
const noop = () => {}
const noopAsync = async() => {}
const emptySubscription = () => noop

export const exitApp = UtilsModule?.exitApp
  ? () => UtilsModule.exitApp()
  : () => {
      if (Platform.OS === 'android') BackHandler.exitApp()
    }

export const getSupportedAbis = UtilsModule?.getSupportedAbis
  ? UtilsModule.getSupportedAbis as () => Promise<string[]>
  : async() => Platform.OS === 'ios' ? ['arm64'] : ['universal']

export const installApk = UtilsModule?.installApk
  ? (filePath: string, fileProviderAuthority: string) => UtilsModule.installApk(filePath, fileProviderAuthority)
  : async() => {}

export const screenkeepAwake = () => {
  if (global.lx.isScreenKeepAwake) return
  global.lx.isScreenKeepAwake = true
  UtilsModule?.screenkeepAwake?.()
}
export const screenUnkeepAwake = () => {
  if (!global.lx.isScreenKeepAwake) return
  global.lx.isScreenKeepAwake = false
  UtilsModule?.screenUnkeepAwake?.()
}

export const getWIFIIPV4Address = UtilsModule?.getWIFIIPV4Address
  ? UtilsModule.getWIFIIPV4Address as () => Promise<string>
  : async() => '127.0.0.1'

export const getDeviceName = async(): Promise<string> => {
  if (!UtilsModule?.getDeviceName) return Platform.OS === 'ios' ? 'iPhone' : 'Unknown'
  return UtilsModule.getDeviceName().then((deviceName: string) => deviceName || 'Unknown')
}

export const isNotificationsEnabled = UtilsModule?.isNotificationsEnabled
  ? UtilsModule.isNotificationsEnabled as () => Promise<boolean>
  : async() => true

export const requestNotificationPermission = UtilsModule?.openNotificationPermissionActivity
  ? async() => new Promise<boolean>((resolve) => {
      let subscription = AppState.addEventListener('change', (state) => {
        if (state != 'active') return
        subscription.remove()
        setTimeout(() => {
          void isNotificationsEnabled().then(resolve)
        }, 1000)
      })
      UtilsModule.openNotificationPermissionActivity().then((result: boolean) => {
        if (result) return
        subscription.remove()
        resolve(false)
      })
    })
  : async() => true

export const shareText = async(shareTitle: string, title: string, text: string): Promise<void> => {
  if (UtilsModule?.shareText) return UtilsModule.shareText(shareTitle, title, text)
  await Share.share({ title, message: text })
}

export const getSystemLocales = async(): Promise<string> => {
  if (UtilsModule?.getSystemLocales) return UtilsModule.getSystemLocales()
  const locale = Intl.DateTimeFormat().resolvedOptions().locale
  return locale || 'zh-CN'
}

export const onScreenStateChange = (handler: (state: 'ON' | 'OFF') => void): () => void => {
  if (!UtilsModule) return emptySubscription()
  const eventEmitter = new NativeEventEmitter(UtilsModule)
  const eventListener = eventEmitter.addListener('screen-state', event => {
    handler(event.state as 'ON' | 'OFF')
  })

  return () => {
    eventListener.remove()
  }
}

export const getWindowSize = async(): Promise<{ width: number, height: number }> => {
  if (UtilsModule?.getWindowSize) return UtilsModule.getWindowSize()
  const { width, height } = Dimensions.get('window')
  return { width, height }
}

export const onWindowSizeChange = (handler: (size: { width: number, height: number }) => void): () => void => {
  if (!UtilsModule?.listenWindowSizeChanged) {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      handler({ width: window.width, height: window.height })
    })
    return () => subscription.remove()
  }
  UtilsModule.listenWindowSizeChanged()
  const eventEmitter = new NativeEventEmitter(UtilsModule)
  const eventListener = eventEmitter.addListener('screen-size-changed', event => {
    handler(event as { width: number, height: number })
  })

  return () => {
    eventListener.remove()
  }
}

export const isIgnoringBatteryOptimization = async(): Promise<boolean> => {
  if (!UtilsModule?.isIgnoringBatteryOptimization) return true
  return UtilsModule.isIgnoringBatteryOptimization()
}

export const requestIgnoreBatteryOptimization = UtilsModule?.requestIgnoreBatteryOptimization
  ? async() => new Promise<boolean>((resolve) => {
      let subscription = AppState.addEventListener('change', (state) => {
        if (state != 'active') return
        subscription.remove()
        setTimeout(() => {
          void isIgnoringBatteryOptimization().then(resolve)
        }, 1000)
      })
      UtilsModule.requestIgnoreBatteryOptimization().then((result: boolean) => {
        if (result) return
        subscription.remove()
        resolve(false)
      })
    })
  : async() => true
