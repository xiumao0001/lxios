import { NativeModules } from 'react-native'

const { CacheModule } = NativeModules

export const getAppCacheSize = async(): Promise<number> => {
  if (!CacheModule?.getAppCacheSize) return 0
  return CacheModule.getAppCacheSize().then((size: number) => Math.trunc(size))
}
export const clearAppCache = CacheModule?.clearAppCache
  ? CacheModule.clearAppCache as () => Promise<void>
  : async() => {}
