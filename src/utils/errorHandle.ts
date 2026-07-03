import { Alert } from 'react-native'
// import { exitApp } from '@/utils/common'
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler'
import { log } from '@/utils/log'
import { toast } from './tools'

const errorHandler = (e: Error, isFatal: boolean) => {
  const excludedErrors = [
    'Failed to construct \'Response\'',
  ]
  if (isFatal) {
    if (excludedErrors.some((excludedError) => e.message.includes(excludedError))) {
      toast('应用遇到网络响应解析异常，请稍后重试。')
    } else {
      Alert.alert(
        '应用遇到错误',
        `
  应用遇到异常。请把下面的错误信息截图发给我，我会继续修。

  错误：
  ${isFatal ? 'Fatal:' : ''} ${e.name} ${e.message}
  `,
        [{
          text: '关闭',
          onPress: () => {
            // exitApp()
          },
        }],
      )
    }
  }
  log.error(e.stack)
}

if (process.env.NODE_ENV !== 'development') {
  setJSExceptionHandler(errorHandler)

  setNativeExceptionHandler((errorString) => {
    log.error(errorString)
    console.log('+++++', errorString, '+++++')
  }, false)
}
