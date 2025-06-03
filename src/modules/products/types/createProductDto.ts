export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  categories?: string[];
  count?: number;
}
