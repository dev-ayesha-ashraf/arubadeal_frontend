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

// interface DetailedCar {
//   _id: string;
//   engineId: string;
//   [key: string]: any;
// }

// interface Engine {
//   _id: string;
//   name: string;
// }
