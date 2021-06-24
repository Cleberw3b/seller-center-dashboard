export class PersonInfo {
  isPF: boolean
  firstName: string
  lastName: string
  cpf: string
  birthday?: string

  constructor(isPF: boolean, firstName: string, lastName: string, cpf: string, birthday?: string) {
    this.isPF = isPF;
    this.firstName = firstName;
    this.lastName = lastName;
    this.cpf = cpf;
    this.birthday = birthday
  }
}

export class CompanyInfo {
  isPJ: boolean
  cnpj: string
  name: string
  razaoSocial: string
  inscricaoEstadual?: string
  inscricaoMunicipal?: string

  constructor(isPJ: boolean, cnpj: string, name: string, razaoSocial: string, inscricaoEstadual?: string, inscricaoMunicial?: string) {
    this.isPJ = isPJ
    this.cnpj = cnpj
    this.name = name
    this.razaoSocial = razaoSocial
    this.inscricaoEstadual = inscricaoEstadual
    this.inscricaoMunicipal = inscricaoMunicial
  }
}
