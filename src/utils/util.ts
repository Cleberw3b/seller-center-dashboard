import jwt from 'jsonwebtoken'

/**
 * Call it inside an async function and it will sleep
 *
 * @param ms - milliseconds
 */
export const sleep = (ms: number = 1) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Returns the callee name
 *
 * @param depth - Pass depth to get the name of the higher level function
 */
export const getFunctionName = (depth: number = 1) => {
  const error = new Error()
  if (error.stack) {
    // tslint:disable-next-line:max-line-length
    return ((((error.stack.split('at ') || [])[1 + depth] || '').match(/(^|\.| <| )(.*[^(<])( \()/) || [])[2] || '').split('.').pop()
  }
  return 'NULL'
}

/**
 *
 * @param timestamp Unix timestamp
 * @returns YYYY-MM-DD format from a timestamp
 */
export const formatDateFromTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  const year = date.getFullYear()
  const month = date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  const day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay()
  return year + '-' + month + '-' + day
}

/**
 *
 * @param isoDate isoDate
 * @returns DD/MM/YYYY format from a ISO string date
 */
export const formatDateFromIsoFormat = (isoDate: string): string => {
  return isoDate
    .slice(0, 10)
    .split('-')
    .reverse()
    .join('/')
}

/**
 *
 * @param isoDate
 * @returns an integer that represents time from an ISO format string date
 */
export const getIntFromDate = (isoDate: string) => {
  return parseInt(
    isoDate
      .replace('T', '')
      .replace('Z', '')
      .replace('.', '')
      .replace(/:/g, '')
      .replace(/-/g, '')
    , 10)
}

export const throttle = (func: (...args: any) => any, delay: number) => {
  let inProgress = false
  return (...args: any) => {
    if (inProgress) {
      return
    }
    inProgress = true
    // Consider moving this line before the set timeout if you want the very first one to be immediate
    func(...args)
    setTimeout(() => {
      inProgress = false
    }, delay)
  }
}

/**
 *
 * @param value that need to be proved
 * @returns true | false whether is a number or not
 */
export const isNumber = (value: string | number): boolean => {
  return ((value != null) &&
    (value !== '') &&
    !isNaN(Number(value.toString())))
}

/**
  * Verifies whether the email is valid or not
  *
  * @param email
  * @returns true or false
*/
export const isEmailValid = (email: string) => {

  const validEmailRegex = /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/

  return validEmailRegex.test(email)
}

/**
 * Verifies whether a password is secure or not
 *
 * @param password
 * @returns true or false
 */
export const isPasswordSecure = (password: string): boolean => {


  const strongPasswordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')

  console.log(`(${strongPasswordRegex.test(password)}) - ${password}`);

  return strongPasswordRegex.test(password)
}

export const nowInSeconds = () => {
  return Math.floor(Date.now() / 1000)
}

export const isTokenValid = (token: string | undefined): boolean => {

  if (!token) return false

  let decoded: any

  try {
    decoded = jwt.verify(token, 'lI@D2zeg$e6mKY!5', {})
  } catch (error) {
    if (error instanceof Error)
      console.log(error.message, 'EVENT', 'JWT Verification', 'ERROR')
    return false
  }

  if (!decoded || !decoded.exp) return false

  const now = nowInSeconds()

  return decoded.exp >= now
}

const getFormData = object => Object.keys(object).reduce((formData, key) => {
  formData.append(key, object[key]);
  return formData;
}, new FormData());
