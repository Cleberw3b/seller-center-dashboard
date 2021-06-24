export interface Category {
  _id?: any,
  code: number,
  value: string
}

export interface SubCategory {
  _id?: any,
  categoryCode: number,
  code: number,
  value: string,
}
