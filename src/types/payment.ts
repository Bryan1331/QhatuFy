export interface PaymentRequirement {
  id: string;
  contractName: string;
  amount: number;
  currency: 'PEN' | 'USD';
  dueDate: string;
  isPaid: boolean;
  status?: 'pendiente' | 'en_revision' | 'pagado' | 'rechazado';
}
