export type TxnType = "expense" | "income";

export interface Transaction {
  id: string;
  type: TxnType;
  amount: number;
  category: string;
  note?: string;
  date: string; // ISO string
}
