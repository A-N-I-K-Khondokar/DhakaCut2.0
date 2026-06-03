export interface User {
  id: string;
  email: string;
  displayName: string;
  phone: string;
  role: 'admin' | 'customer';
  createdAt: string;
}
