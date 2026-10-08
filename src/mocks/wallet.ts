export type CoinBalance = { companyId: string; amount: number };

export type Wallet = {
  aprovPoints: number;
  coins: CoinBalance[];
};

export const initialWallet: Wallet = {
  aprovPoints: 120,
  coins: [
    { companyId: 'c1', amount: 340 },
    { companyId: 'c5', amount: 80 },
    { companyId: 'c7', amount: 45 },
  ],
};
