import React, { createContext, useContext, useMemo, useState } from 'react';

type CurrencyCode = 'MXN' | 'USD';

export type Account = {
  id: string;
  alias: string;
  number: string;
  balance: number;
  currency: CurrencyCode;
  iban?: string;
};

export type TransactionType = 'create-account' | 'deposit' | 'transfer';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  fromAccountId?: string;
  toAccountId?: string;
  description?: string;
  timestamp: string;
};

type CreateAccountPayload = {
  alias: string;
  initialBalance?: number;
  currency?: CurrencyCode;
};

type DepositPayload = {
  accountId: string;
  amount: number;
  description?: string;
};

type TransferPayload = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
};

type BankingContextValue = {
  accounts: Account[];
  transactions: Transaction[];
  totalBalance: number;
  createAccount: (payload: CreateAccountPayload) => ActionResult;
  deposit: (payload: DepositPayload) => ActionResult;
  transfer: (payload: TransferPayload) => ActionResult;
};

type ActionResult =
  | {
      success: true;
      message?: string;
    }
  | {
      success: false;
      message: string;
    };

const BankingContext = createContext<BankingContextValue | undefined>(undefined);

const createAccountNumber = () =>
  `**** ${Math.floor(1000 + Math.random() * 9000)
    .toString()
    .padStart(4, '0')}`;

const createIban = () => `MX${Math.floor(10 ** 17 + Math.random() * 9 * 10 ** 17)}`;

const now = () => new Date().toISOString();

const initialAccounts: Account[] = [
  {
    id: 'acc-0001',
    alias: 'Cuenta Nomina',
    number: '**** 3456',
    balance: 26540.75,
    currency: 'MXN',
    iban: createIban(),
  },
  {
    id: 'acc-0002',
    alias: 'Ahorro Vacaciones',
    number: '**** 9081',
    balance: 8200.0,
    currency: 'MXN',
    iban: createIban(),
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'tx-001',
    type: 'deposit',
    amount: 5500,
    currency: 'MXN',
    toAccountId: 'acc-0001',
    description: 'Pago de nomina',
    timestamp: now(),
  },
  {
    id: 'tx-002',
    type: 'transfer',
    amount: 2000,
    currency: 'MXN',
    fromAccountId: 'acc-0001',
    toAccountId: 'acc-0002',
    description: 'Ahorro mensual',
    timestamp: now(),
  },
];

export const BankingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + account.balance, 0),
    [accounts],
  );

  const pushTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    setTransactions((prev) => [
      { ...transaction, id: `tx-${Date.now()}`, timestamp: now() },
      ...prev,
    ]);
  };

  const createAccount = ({ alias, initialBalance = 0, currency = 'MXN' }: CreateAccountPayload) => {
    if (!alias.trim()) {
      return { success: false, message: 'Asigna un alias a la cuenta.' } as ActionResult;
    }

    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      alias: alias.trim(),
      number: createAccountNumber(),
      balance: initialBalance,
      currency,
      iban: createIban(),
    };

    // TODO: Hook create account API here (e.g. await bankingApi.accounts.create(newAccount))

    setAccounts((prev) => [newAccount, ...prev]);

    if (initialBalance > 0) {
      pushTransaction({
        type: 'create-account',
        amount: initialBalance,
        currency,
        toAccountId: newAccount.id,
        description: 'Saldo inicial',
      });
    }

    return { success: true, message: 'Cuenta creada correctamente.' };
  };

  const deposit = ({ accountId, amount, description }: DepositPayload) => {
    if (!amount || amount <= 0) {
      return { success: false, message: 'Ingresa un monto mayor a cero.' } as ActionResult;
    }

    const account = accounts.find((item) => item.id === accountId);

    if (!account) {
      return { success: false, message: 'Selecciona una cuenta valida.' } as ActionResult;
    }

    // TODO: Hook deposit API here (e.g. await bankingApi.accounts.deposit(accountId, amount))

    setAccounts((prev) =>
      prev.map((item) =>
        item.id === accountId ? { ...item, balance: item.balance + amount } : item,
      ),
    );

    pushTransaction({
      type: 'deposit',
      amount,
      currency: account.currency,
      toAccountId: accountId,
      description: description?.trim() || 'Deposito',
    });

    return { success: true, message: 'Deposito registrado.' };
  };

  const transfer = ({ fromAccountId, toAccountId, amount, description }: TransferPayload) => {
    if (!amount || amount <= 0) {
      return { success: false, message: 'Ingresa un monto mayor a cero.' };
    }

    if (fromAccountId === toAccountId) {
      return { success: false, message: 'Selecciona cuentas diferentes.' };
    }

    const origin = accounts.find((item) => item.id === fromAccountId);
    const destination = accounts.find((item) => item.id === toAccountId);

    if (!origin || !destination) {
      return { success: false, message: 'Selecciona cuentas validas.' };
    }

    if (origin.balance < amount) {
      return { success: false, message: 'Saldo insuficiente en la cuenta de origen.' };
    }

    // TODO: Hook transfer API here (e.g. await bankingApi.transfers.create({...}))

    setAccounts((prev) =>
      prev.map((item) => {
        if (item.id === fromAccountId) {
          return { ...item, balance: item.balance - amount };
        }
        if (item.id === toAccountId) {
          return { ...item, balance: item.balance + amount };
        }
        return item;
      }),
    );

    pushTransaction({
      type: 'transfer',
      amount,
      currency: origin.currency,
      fromAccountId,
      toAccountId,
      description: description?.trim() || 'Transferencia',
    });

    return { success: true, message: 'Transferencia realizada.' };
  };

  const value = useMemo(
    () => ({
      accounts,
      transactions,
      totalBalance,
      createAccount,
      deposit,
      transfer,
    }),
    [accounts, transactions, totalBalance],
  );

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>;
};

export const useBanking = () => {
  const context = useContext(BankingContext);

  if (!context) {
    throw new Error('useBanking debe usarse dentro de un BankingProvider');
  }

  return context;
};
