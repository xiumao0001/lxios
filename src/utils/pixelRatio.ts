/**
 * Created by qianxin on 17/6/1.
 * 閻忕偛绻愮粻宄邦啅閵夈儱寰旂紒? * ui閻犱焦宕橀鎼佸春閸濆嫬娅?iphone 6
 * width:375
 * height:667
 */
import { Dimensions, PixelRatio } from 'react-native'
import { windowSizeTools } from './windowSizeTools'

const designWidth = 375.0
const designHeight = 667.0

const getFontScale = () => PixelRatio.getFontScale()
const getPixelRatio = () => PixelRatio.get()
const getAppFontSize = () => global.lx?.fontSize || 1

const getScreenSize = () => {
  const size = windowSizeTools.getSize()
  const fallback = Dimensions.get('window')
  let screenW = size.width || fallback.width || designWidth
  let screenH = size.height || fallback.height || designHeight
  if (screenW > screenH) {
    const temp = screenW
    screenW = screenH
    screenH = temp
  }
  return { screenW, screenH }
}

const getScaleInfo = () => {
  const { screenW, screenH } = getScreenSize()
  const pixelRatio = getPixelRatio()
  const screenPxW = PixelRatio.getPixelSizeForLayoutSize(screenW)
  const screenPxH = PixelRatio.getPixelSizeForLayoutSize(screenH)
  const scaleW = screenPxW / designWidth
  const scaleH = screenPxH / designHeight
  const scale = Math.min(scaleW, scaleH, 3.1)
  return { screenW, screenH, pixelRatio, scale }
}

/**
 * 閻犱礁澧介悿鍞梕xt
 * @param size  px
 * @returns dp
 */
export function getTextSize(size: number) {
  const { screenW, screenH } = getScreenSize()
  const scaleWidth = screenW / designWidth
  const scaleHeight = screenH / designHeight
  const scale = Math.min(scaleWidth, scaleHeight, 1.3)
  return Math.max(1, Math.floor(size * scale / getFontScale()))
}
export function setSpText(size: number) {
  return getTextSize(size) * getAppFontSize()
}

/**
 * 閻犱礁澧介悿鍡橆殗濡搫顔? * @param size  px
 * @returns dp
 */
export function scaleSizeH(size: number) {
  if (!size) return 0
  const { scale, pixelRatio } = getScaleInfo()
  return Math.max(1, Math.floor(size * scale / pixelRatio)) * getAppFontSize()
}

/**
 * 閻犱礁澧介悿鍡欌偓纭呮鐎? * @param size  px
 * @returns dp
 */
export function scaleSizeW(size: number) {
  if (!size) return 0
  const { scale, pixelRatio } = getScaleInfo()
  return Math.max(1, Math.floor(size * scale / pixelRatio)) * getAppFontSize()
}

export const scaleSizeWR = (size: number) => {
  return size * 2 - scaleSizeW(size)
}

export const scaleSizeHR = (size: number) => {
  return size * 2 - scaleSizeH(size)
}

export const scaleSizeAbsHR = (size: number) => {
  const { scale, pixelRatio } = getScaleInfo()
  return size * 2 - Math.floor(size * scale / pixelRatio)
}
