//
//     Errors
//

import { errorCode } from './errorCode'

/**
 * Define Interface AppError
 */
export type AppError = {
  errorCode: errorCode
  description: string
  tip: string
  example?: string[]
}

/**
 * NEVER USE
 */
export const voidError: AppError = {
  errorCode: 0x000,
  description: 'It should never happen, call a developer.',
  tip: 'Miss developed.',
  example: ['Do not use.']
}

/**
 * ERROR - Login Fail
 */
export const loginFail: AppError = {
  errorCode: 0x001,
  description: 'Credentials invalid.',
  tip: 'Check your login and password.',
  example: [
    `{
            \'login\': \'Your Login\',
            \'password\': \'Your Passwor\'
        }`
  ]
}

/**
 * ERROR - Invalid Email
 */
export const invalidEmail: AppError = {
  errorCode: 0x002,
  description: 'Email invalid.',
  tip: 'Check the field e-mail.',
  example: [
    `example@mail.com`
  ]
}

/**
 * ERROR - Invalid Paswword
 */
export const invalidPassword: AppError = {
  errorCode: 0x003,
  description: 'Password invalid.',
  tip: 'Check the field password, it must be a strong password.',
  example: [
    `
        The password is at least 8 characters long.
        The password has at least one uppercase letter.
        The password has at least one lowercase letter.
        The password has at least one digit.
        The password has at least one special character.
         `
  ]
}

/**
 * ERROR - User already exists
 */
export const userExists: AppError = {
  errorCode: 0x004,
  description: 'User already exists.',
  tip: 'Try to login or recover your password.',
  example: [``]
}

/**
 * ERROR - User does not exists
 */
export const userNotExists: AppError = {
  errorCode: 0x005,
  description: 'User does not exists.',
  tip: 'Check the email informed.',
  example: [``]
}

/**
 * ERROR - Invalid Activation Token
 */
export const invalidActivationToken: AppError = {
  errorCode: 0x006,
  description: 'Activation token invalid.',
  tip: 'Check your e-mail for the valid url registration.',
  example: [``]
}

/**
 * ERROR - Invalid User Reference
 */
export const invalidUserReference: AppError = {
  errorCode: 0x007,
  description: 'User id invalid.',
  tip: 'The user passed as reference is invalid. Check your reference ID to submit a request.',
  example: [``]
}

/**
 * ERROR - Invalid First Name
 */
export const invalidFirstName: AppError = {
  errorCode: 0x008,
  description: 'First name invalid.',
  tip: 'Check first name field.',
  example: [`
        The first name is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid Last Name
 */
export const invalidLastName: AppError = {
  errorCode: 0x009,
  description: 'Last name invalid.',
  tip: 'Check last name field.',
  example: [`
        The last name is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid CPF
 */
export const invalidCPF: AppError = {
  errorCode: 0x010,
  description: 'CPF invalid.',
  tip: 'Check cpf field.',
  example: [`
        You must have a valid CPF to register.
    `]
}

/**
 * ERROR - Invalid CPF
 */
export const invalidRG: AppError = {
  errorCode: 0x00A,
  description: 'RG invalid.',
  tip: 'Check rg field.',
  example: [`
        The RG is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid Birthday
 */
export const invalidBirthday: AppError = {
  errorCode: 0x00B,
  description: 'Birthday invalid.',
  tip: 'Check birthday field.',
  example: [`
        01/01/1970
    `]
}

/**
 * ERROR - Invalid CEP
 */
export const invalidCEP: AppError = {
  errorCode: 0x00C,
  description: 'CEP invalid.',
  tip: 'Check cep field.',
  example: [`
        The cep is 7 characters long.
    `]
}

/**
 * ERROR - Invalid Address
 */
export const invalidAddress: AppError = {
  errorCode: 0x00D,
  description: 'Address invalid.',
  tip: 'Check address field.',
  example: [`
        The address is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid City
 */
export const invalidCity: AppError = {
  errorCode: 0x00E,
  description: 'City invalid.',
  tip: 'Check city field.',
  example: [`
        The city is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid Complement
 */
export const invalidComplement: AppError = {
  errorCode: 0x00F,
  description: 'Complement invalid.',
  tip: 'Check complement field.',
  example: [`
        The complement is at least 4 characters long.
        The complement is at maximum 24 characters long.
    `]
}

/**
 * ERROR - Invalid District
 */
export const invalidDistrict: AppError = {
  errorCode: 0x010,
  description: 'District is invalid.',
  tip: 'Check district field.',
  example: [`
        The district is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid Address Number
 */
export const invalidAddressNumber: AppError = {
  errorCode: 0x011,
  description: 'Address number is invalid.',
  tip: 'Check address number field.',
  example: [`
        The address Number is at least 1 character long.
    `]
}

/**
 * ERROR - Invalid CNPJ
 */
export const invalidCNPJ: AppError = {
  errorCode: 0x012,
  description: 'CNPJ is invalid.',
  tip: 'Check cnpj field.',
  example: [`
        You must have a valid CNPJ to register.
        The cnpj is at least 14 characters long.
    `]
}

/**
 * ERROR - Invalid Shop name
 */
export const invalidShopName: AppError = {
  errorCode: 0x013,
  description: 'Shop name is invalid.',
  tip: 'Check name field.',
  example: [`
        The shop name is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid Bank Code
 */
export const invalidBankCode: AppError = {
  errorCode: 0x014,
  description: 'Bank Code is invalid.',
  tip: 'Check bank field.',
  example: [`
        The bank code does not exists.
    `]
}

/**
 * ERROR - Invalid Account
 */
export const invalidAccount: AppError = {
  errorCode: 0x015,
  description: 'Account is invalid.',
  tip: 'Check account field.',
  example: [`
        The account is at least 2 characters long.
    `]
}

/**
 * ERROR - Invalid Agency Number
 */
export const invalidAgency: AppError = {
  errorCode: 0x016,
  description: 'Agency is invalid.',
  tip: 'Check agency field.',
  example: [`
        The agency is at least 2 characters long.
    `]
}


/**
 * ERROR - Invalid Product
 */
export const invalidProduct: AppError = {
  errorCode: 0x016,
  description: 'Product is invalid.',
  tip: 'Check your form.',
  example: [`
        Product invalid.
    `]
}

/**
 * Lista com todos os erros relacionados a Client
 */
export const errorsList: AppError[] = [
]


/**
 * Retorna um error object dependendo do código referenciado
 *
 * @param errorCode
 */
export const findError = (errorCode: errorCode) => {
  return errorsList.find(error => error.errorCode === errorCode) || voidError
}
