export type Variation = {
  size: number | string,
  stock: number,
  color: string,
}

export type Product = {
  images: {
    id: any,
    name: string,
    alt_text: string,
    url: string,
  }[],
  name: string,
  description: string,
  brand: string,
  more_info?: string,
  ean?: string,
  sku: string,
  gender: string,
  price: number,
  price_discounted?: number;
  height?: number,
  width?: number,
  length?: number,
  weight?: number,

  variations: Variation[],

  nationality: string,
  category: string,
  sub_category: string,
}

export type ProductSummary = {
  _id: string;
  isActive: boolean;
  name: string;
  brand: string;
  sku: string;
  price: number;
  stock: number;
  images?: string[];
  variations: Variation[];
}
