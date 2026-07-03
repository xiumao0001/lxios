import { NativeModules } from 'react-native'
import { Buffer } from '@craftzdog/react-native-buffer'

const CryptoJS = require('crypto-js')
const forge = require('node-forge')
const { CryptoModule } = NativeModules

// export const testRsa = (text: string, key: string) => {
//   return CryptoModule.testRsa()
// }

enum KEY_PREFIX {
  publicKeyStart = '-----BEGIN PUBLIC KEY-----',
  publicKeyEnd = '-----END PUBLIC KEY-----',
  privateKeyStart = '-----BEGIN PRIVATE KEY-----',
  privateKeyEnd = '-----END PRIVATE KEY-----',
}

export enum RSA_PADDING {
  OAEPWithSHA1AndMGF1Padding = 'RSA/ECB/OAEPWithSHA1AndMGF1Padding', NoPadding = 'RSA/ECB/NoPadding',
}

export enum AES_MODE {
  CBC_128_PKCS7Padding = 'AES/CBC/PKCS7Padding', ECB_128_NoPadding = 'AES',
}

const normalizePublicKey = (key: string) => key.includes(KEY_PREFIX.publicKeyStart)
  ? key
  : `${KEY_PREFIX.publicKeyStart}\n${key}\n${KEY_PREFIX.publicKeyEnd}`
const normalizePrivateKey = (key: string) => key.includes(KEY_PREFIX.privateKeyStart)
  ? key
  : `${KEY_PREFIX.privateKeyStart}\n${key}\n${KEY_PREFIX.privateKeyEnd}`
const stripPublicKey = (key: string) => key.replace(KEY_PREFIX.publicKeyStart, '').replace(KEY_PREFIX.publicKeyEnd, '')
const stripPrivateKey = (key: string) => key.replace(KEY_PREFIX.privateKeyStart, '').replace(KEY_PREFIX.privateKeyEnd, '')

const b64ToWordArray = (b64: string) => CryptoJS.enc.Base64.parse(b64 || '')
const wordArrayToB64 = (wa: any) => CryptoJS.enc.Base64.stringify(wa)

const getAesOptions = (mode: AES_MODE, vi: string) => {
  if (mode == AES_MODE.CBC_128_PKCS7Padding) {
    return {
      iv: b64ToWordArray(vi),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  }
  return {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }
}

const jsAesEncrypt = (text: string, key: string, vi: string, mode: AES_MODE): string => {
  const encrypted = CryptoJS.AES.encrypt(b64ToWordArray(text), b64ToWordArray(key), getAesOptions(mode, vi))
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64)
}

const jsAesDecrypt = (text: string, key: string, vi: string, mode: AES_MODE): string => {
  const decrypted = CryptoJS.AES.decrypt({ ciphertext: b64ToWordArray(text) }, b64ToWordArray(key), getAesOptions(mode, vi))
  return wordArrayToB64(decrypted)
}

const jsRsaEncrypt = (text: string, key: string, padding: RSA_PADDING): string => {
  const publicKey = forge.pki.publicKeyFromPem(normalizePublicKey(key))
  const bytes = forge.util.createBuffer(Buffer.from(text, 'base64').toString('binary')).getBytes()
  const scheme = padding == RSA_PADDING.OAEPWithSHA1AndMGF1Padding
    ? 'RSA-OAEP'
    : 'RAW'
  let encrypted = publicKey.encrypt(bytes, scheme, scheme == 'RSA-OAEP' ? { md: forge.md.sha1.create(), mgf1: { md: forge.md.sha1.create() } } : undefined)
  return Buffer.from(encrypted, 'binary').toString('base64')
}

const jsRsaDecrypt = (text: string, key: string, padding: RSA_PADDING): string => {
  const privateKey = forge.pki.privateKeyFromPem(normalizePrivateKey(key))
  const bytes = forge.util.createBuffer(Buffer.from(text, 'base64').toString('binary')).getBytes()
  const scheme = padding == RSA_PADDING.OAEPWithSHA1AndMGF1Padding
    ? 'RSA-OAEP'
    : 'RAW'
  const decrypted = privateKey.decrypt(bytes, scheme, scheme == 'RSA-OAEP' ? { md: forge.md.sha1.create(), mgf1: { md: forge.md.sha1.create() } } : undefined)
  return Buffer.from(decrypted, 'binary').toString('base64')
}

export const generateRsaKey = async() => {
  if (CryptoModule?.generateRsaKey) {
    const key = await CryptoModule.generateRsaKey() as { publicKey: string, privateKey: string }
    return {
      publicKey: `${KEY_PREFIX.publicKeyStart}\n${key.publicKey}${KEY_PREFIX.publicKeyEnd}`,
      privateKey: `${KEY_PREFIX.privateKeyStart}\n${key.privateKey}${KEY_PREFIX.privateKeyEnd}`,
    }
  }
  const pair = forge.pki.rsa.generateKeyPair({ bits: 1024, workers: 0 })
  return {
    publicKey: forge.pki.publicKeyToPem(pair.publicKey),
    privateKey: forge.pki.privateKeyToPem(pair.privateKey),
  }
}

export const rsaEncrypt = async(text: string, key: string, padding: RSA_PADDING): Promise<string> => {
  if (CryptoModule?.rsaEncrypt) return CryptoModule.rsaEncrypt(text, stripPublicKey(key), padding)
  return jsRsaEncrypt(text, key, padding)
}

export const rsaDecrypt = async(text: string, key: string, padding: RSA_PADDING): Promise<string> => {
  if (CryptoModule?.rsaDecrypt) return CryptoModule.rsaDecrypt(text, stripPrivateKey(key), padding)
  return jsRsaDecrypt(text, key, padding)
}

export const rsaEncryptSync = (text: string, key: string, padding: RSA_PADDING): string => {
  if (CryptoModule?.rsaEncryptSync) return CryptoModule.rsaEncryptSync(text, stripPublicKey(key), padding)
  return jsRsaEncrypt(text, key, padding)
}

export const rsaDecryptSync = (text: string, key: string, padding: RSA_PADDING): string => {
  if (CryptoModule?.rsaDecryptSync) return CryptoModule.rsaDecryptSync(text, stripPrivateKey(key), padding)
  return jsRsaDecrypt(text, key, padding)
}

export const aesEncrypt = async(text: string, key: string, vi: string, mode: AES_MODE): Promise<string> => {
  if (CryptoModule?.aesEncrypt) return CryptoModule.aesEncrypt(text, key, vi, mode)
  return jsAesEncrypt(text, key, vi, mode)
}

export const aesDecrypt = async(text: string, key: string, vi: string, mode: AES_MODE): Promise<string> => {
  if (CryptoModule?.aesDecrypt) return CryptoModule.aesDecrypt(text, key, vi, mode)
  return jsAesDecrypt(text, key, vi, mode)
}

export const aesEncryptSync = (text: string, key: string, vi: string, mode: AES_MODE): string => {
  if (CryptoModule?.aesEncryptSync) return CryptoModule.aesEncryptSync(text, key, vi, mode)
  return jsAesEncrypt(text, key, vi, mode)
}

export const aesDecryptSync = (text: string, key: string, vi: string, mode: AES_MODE): string => {
  if (CryptoModule?.aesDecryptSync) return CryptoModule.aesDecryptSync(text, key, vi, mode)
  return jsAesDecrypt(text, key, vi, mode)
}

export const hashSHA1 = async(text: any) => {
  if (CryptoModule?.sha1) return CryptoModule.sha1(text)
  const data = typeof text == 'string' ? text : JSON.stringify(text)
  return CryptoJS.SHA1(data).toString(CryptoJS.enc.Hex)
}
