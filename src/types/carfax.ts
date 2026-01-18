export interface CarfaxPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

export interface CarfaxFormData {
  packageId: string;
  vin: string;
  email: string;
  whatsapp: string;
  paymentMethod: "credit_card" | "debit_card" | "paypal" | "apple_pay";
}

export interface CarfaxOrder {
  id: string;
  orderNumber: string;
  packageName: string;
  vin: string;
  email: string;
  whatsapp: string;
  amount: number;
  paymentMethod: string;
  status: "pending" | "completed" | "processing";
  createdAt: string;
  estimatedDelivery?: string;
}
