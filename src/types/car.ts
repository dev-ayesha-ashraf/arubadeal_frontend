export interface Car {
  _id: string;
  title: string;
  price: string;
  mileage: number;
  make: string;
  model?: string;
  transmission: string;
  type: string; 
  color?: string;
  seats?: number; 
  image: string;
  address: string;
  status?: number;
  year?: number;
  serialNumber?: string;
  makeId?: string;
  slug: string;
}
