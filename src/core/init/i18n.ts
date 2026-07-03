import { createI18n } from '@/lang/i18n'
import type { I18n } from '@/lang/i18n'
import { getDeviceLanguage } from '@/utils/tools'
import { setLanguage, updateSetting } from '@/core/common'
import { Platform } from 'react-native'


export default async(setting: LX.AppSetting) => {
  let lang = setting['common.langId']

  global.i18n = createI18n()

  if (Platform.OS == 'ios' && lang !== 'zh_cn') {
    lang = 'zh_cn'
    updateSetting({ 'common.langId': lang })
  } else if (!lang || !global.i18n.availableLocales.includes(lang)) {
    const deviceLanguage = (await getDeviceLanguage()).toLowerCase().replace(/-/g, '_')
    const normalizedLanguage = deviceLanguage.startsWith('zh') ? 'zh_cn' : deviceLanguage
    if (typeof normalizedLanguage == 'string' && global.i18n.availableLocales.includes(normalizedLanguage as I18n['locale'])) {
      lang = normalizedLanguage as I18n['locale']
    } else {
      lang = 'zh_cn'
    }
    updateSetting({ 'common.langId': lang })
  }
  setLanguage(lang)
}
