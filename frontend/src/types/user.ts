export interface User {
  id: string;
  email: string;
  role: 'customer' | 'delivery_personnel' | 'restaurant_admin' | 'admin';
}

export interface SignupData {
  email: string;
  password: string;
  role: 'customer' | 'delivery_personnel' | 'restaurant_admin' | 'admin';
}
