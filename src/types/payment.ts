export interface PaymentRequirement {
  id: string;
  contractName: string;
  amount: number;
  currency: 'PEN' | 'USD';
  dueDate: string;
  isPaid: boolean;
}
