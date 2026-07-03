import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import pako from 'pako'
import { Buffer } from '@craftzdog/react-native-buffer'

export type Encoding = 'base64' | 'utf8'
export type HashAlgorithm = 'md5' | 'sha1' | 'sha224' | 'sha256' | 'sha384' | 'sha512'
export interface OpenDocumentOptions {
  mimeTypes?: string[]
  extTypes?: string[]
  multi?: boolean
  toPath?: string
  encoding?: Encoding
}
export interface FileType {
  name: string
  path: string
  isDirectory: boolean
  isFile: boolean
  lastModified: number
  canRead: boolean
  data: string
  mimeType: string
  size: number
}

type AndroidFsModule = typeof import('react-native-file-system')
const AndroidFS: AndroidFsModule | null = Platform.OS === 'ios' ? null : require('react-native-file-system')

const toFileType = (item: any): FileType => {
  const isFile = typeof item.isFile == 'function' ? item.isFile() : !!item.isFile
  const isDirectory = typeof item.isDirectory == 'function' ? item.isDirectory() : !!item.isDirectory
  const mtime = item.mtime instanceof Date ? item.mtime.getTime() : item.mtime ? new Date(item.mtime).getTime() : 0
  return {
    name: item.name || String(item.path || '').split('/').pop() || '',
    path: item.path,
    isDirectory,
    isFile,
    lastModified: mtime,
    canRead: true,
    data: '',
    mimeType: '',
    size: Number(item.size || 0),
  }
}

const iosStat = async(path: string) => toFileType(await RNFS.stat(path))

// export const externalDirectoryPath = RNFS.ExternalDirectoryPath

export const extname = (name: string) => name.lastIndexOf('.') > 0 ? name.substring(name.lastIndexOf('.') + 1) : ''

export const temporaryDirectoryPath = Platform.OS === 'ios'
  ? (RNFS.TemporaryDirectoryPath || RNFS.CachesDirectoryPath)
  : AndroidFS!.Dirs.CacheDir
export const externalStorageDirectoryPath = Platform.OS === 'ios'
  ? RNFS.DocumentDirectoryPath
  : AndroidFS!.Dirs.SDCardDir
export const privateStorageDirectoryPath = Platform.OS === 'ios'
  ? RNFS.DocumentDirectoryPath
  : AndroidFS!.Dirs.DocumentDir

export const getExternalStoragePaths = async(is_removable?: boolean) => Platform.OS === 'ios'
  ? [RNFS.DocumentDirectoryPath]
  : AndroidFS!.getExternalStoragePaths(is_removable)

export const selectManagedFolder = async(isPersist: boolean = false) => {
  if (Platform.OS === 'ios') return iosStat(RNFS.DocumentDirectoryPath)
  return AndroidFS!.AndroidScoped.openDocumentTree(isPersist)
}
export const selectFile = async(options: OpenDocumentOptions) => {
  if (Platform.OS === 'ios') throw new Error('selectFile is not supported on iOS in this build')
  return AndroidFS!.AndroidScoped.openDocument(options)
}
export const removeManagedFolder = async(path: string) => Platform.OS === 'ios'
  ? undefined
  : AndroidFS!.AndroidScoped.releasePersistableUriPermission(path)
export const getManagedFolders = async() => Platform.OS === 'ios'
  ? []
  : AndroidFS!.AndroidScoped.getPersistedUriPermissions()

export const getPersistedUriList = async() => Platform.OS === 'ios'
  ? []
  : AndroidFS!.AndroidScoped.getPersistedUriPermissions()

export const readDir = async(path: string) => Platform.OS === 'ios'
  ? (await RNFS.readDir(path)).map(toFileType)
  : AndroidFS!.FileSystem.ls(path)

export const unlink = async(path: string) => Platform.OS === 'ios'
  ? RNFS.unlink(path).catch(err => {
    if (String(err?.message || err).includes('does not exist')) return false
    throw err
  }).then(() => true)
  : AndroidFS!.FileSystem.unlink(path)

export const mkdir = async(path: string) => {
  if (Platform.OS !== 'ios') return AndroidFS!.FileSystem.mkdir(path)
  await RNFS.mkdir(path)
  return iosStat(path)
}

export const stat = async(path: string) => Platform.OS === 'ios'
  ? iosStat(path)
  : AndroidFS!.FileSystem.stat(path)
export const hash = async(path: string, algorithm: HashAlgorithm) => Platform.OS === 'ios'
  ? RNFS.hash(path, algorithm)
  : AndroidFS!.FileSystem.hash(path, algorithm)

export const readFile = async(path: string, encoding: Encoding = 'utf8') => Platform.OS === 'ios'
  ? RNFS.readFile(path, encoding)
  : AndroidFS!.FileSystem.readFile(path, encoding)

// export const copyFile = async(fromPath: string, toPath: string) => FileSystem.cp(fromPath, toPath)

export const moveFile = async(fromPath: string, toPath: string) => Platform.OS === 'ios'
  ? RNFS.moveFile(fromPath, toPath).then(() => true)
  : AndroidFS!.FileSystem.mv(fromPath, toPath)

export const gzipFile = async(fromPath: string, toPath: string) => {
  if (Platform.OS !== 'ios') return AndroidFS!.FileSystem.gzipFile(fromPath, toPath)
  const data = await RNFS.readFile(fromPath, 'utf8')
  const gz = pako.gzip(data)
  await RNFS.writeFile(toPath, Buffer.from(gz).toString('base64'), 'base64')
}
export const unGzipFile = async(fromPath: string, toPath: string) => {
  if (Platform.OS !== 'ios') return AndroidFS!.FileSystem.unGzipFile(fromPath, toPath)
  const data = await RNFS.readFile(fromPath, 'base64')
  const text = pako.ungzip(Buffer.from(data, 'base64'), { to: 'string' })
  await RNFS.writeFile(toPath, text, 'utf8')
}
export const gzipString = async(data: string, encoding: Encoding = 'utf8') => {
  if (Platform.OS !== 'ios') return AndroidFS!.FileSystem.gzipString(data, encoding)
  const input = encoding === 'base64' ? Buffer.from(data, 'base64') : Buffer.from(data, 'utf8')
  return Buffer.from(pako.gzip(input)).toString('base64')
}
export const unGzipString = async(data: string, encoding: Encoding = 'base64') => {
  if (Platform.OS !== 'ios') return AndroidFS!.FileSystem.unGzipString(data, encoding)
  const input = encoding === 'base64' ? Buffer.from(data, 'base64') : Buffer.from(data, 'utf8')
  return pako.ungzip(input, { to: 'string' })
}

export const existsFile = async(path: string) => Platform.OS === 'ios'
  ? RNFS.exists(path)
  : AndroidFS!.FileSystem.exists(path)

export const rename = async(path: string, name: string) => {
  if (Platform.OS !== 'ios') return AndroidFS!.FileSystem.rename(path, name)
  const toPath = `${path.substring(0, path.lastIndexOf('/'))}/${name}`
  await RNFS.moveFile(path, toPath)
  return true
}

export const writeFile = async(path: string, data: string, encoding: Encoding = 'utf8') => Platform.OS === 'ios'
  ? RNFS.writeFile(path, data, encoding)
  : AndroidFS!.FileSystem.writeFile(path, data, encoding)

export const appendFile = async(path: string, data: string, encoding: Encoding = 'utf8') => Platform.OS === 'ios'
  ? RNFS.appendFile(path, data, encoding)
  : AndroidFS!.FileSystem.appendFile(path, data, encoding)

export const downloadFile = (url: string, path: string, options: Omit<RNFS.DownloadFileOptions, 'fromUrl' | 'toFile'> = {}) => {
  if (!options.headers) {
    options.headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Pixel 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Mobile Safari/537.36',
    }
  }
  return RNFS.downloadFile({
    fromUrl: url, // URL to download file from
    toFile: path, // Local filesystem path to save the file to
    ...options,
    // headers: options.headers, // An object of headers to be passed to the server
    // // background?: boolean;     // Continue the download in the background after the app terminates (iOS only)
    // // discretionary?: boolean;  // Allow the OS to control the timing and speed of the download to improve perceived performance  (iOS only)
    // // cacheable?: boolean;      // Whether the download can be stored in the shared NSURLCache (iOS only, defaults to true)
    // progressInterval: options.progressInterval,
    // progressDivider: options.progressDivider,
    // begin: (res: DownloadBeginCallbackResult) => void;
    // progress?: (res: DownloadProgressCallbackResult) => void;
    // // resumable?: () => void;    // only supported on iOS yet
    // connectionTimeout?: number // only supported on Android yet
    // readTimeout?: number       // supported on Android and iOS
    // // backgroundTimeout?: number // Maximum time (in milliseconds) to download an entire resource (iOS only, useful for timing out background downloads)
  })
}

export const stopDownload = (jobId: number) => {
  RNFS.stopDownload(jobId)
}
