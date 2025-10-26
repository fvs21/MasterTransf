import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as paymentsApi from '@/api/payments';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  isLoadingAccounts: boolean;
  isOffline: boolean;
  syncAccounts: () => Promise<boolean>;
  createAccount: (payload: CreateAccountPayload) => Promise<ActionResult>;
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
  const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Fetch balances from the backend/Nessie when user is available
  const { user } = useAuth();

  const ACCOUNTS_CACHE_KEY = '@bank:accounts';

  // small retry with exponential backoff
  const fetchAccountsWithRetry = async (attempts = 3): Promise<Account[] | null> => {
    if (!user?.customerId) return null;
    let attempt = 0;
    let delay = 500;
    while (attempt < attempts) {
      try {
        const apiAccounts = await paymentsApi.getAccounts(user.customerId);
        if (Array.isArray(apiAccounts)) {
          const mapped: Account[] = apiAccounts.map((a: any) => ({
            id: a._id ?? a.id ?? `acc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            alias: a.nickname ?? a.alias ?? 'Cuenta',
            number: a.account_number ? `**** ${String(a.account_number).slice(-4)}` : createAccountNumber(),
            balance: Number(a.balance) || 0,
            currency: (a.currency as CurrencyCode) ?? 'MXN',
            iban: a.iban ?? undefined,
          }));
          return mapped;
        }
        // unexpected payload, throw to trigger retry/fallback
        throw new Error('Unexpected payload from getAccounts');
      } catch (err) {
        attempt += 1;
        if (attempt >= attempts) {
          console.error('fetchAccountsWithRetry failed:', err);
          return null;
        }
        // exponential backoff
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
    return null;
  };

  useEffect(() => {
    let mounted = true;

    const hydrateBalances = async () => {
      setIsLoadingAccounts(true);
      setIsOffline(false);

      try {
        const mapped = await fetchAccountsWithRetry(3);
        if (!mounted) return;

        if (mapped) {
          setAccounts(mapped);
          try {
            await AsyncStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(mapped));
          } catch (e) {
            console.warn('Failed to persist accounts cache:', e);
          }
          setIsOffline(false);
        } else {
          // try load cache
          const cached = await AsyncStorage.getItem(ACCOUNTS_CACHE_KEY);
          if (cached) {
            setAccounts(JSON.parse(cached));
            setIsOffline(true);
          } else {
            // keep in-memory initialAccounts
            setIsOffline(true);
          }
        }
      } catch (err) {
        console.error('hydrateBalances unexpected error:', err);
      } finally {
        if (mounted) setIsLoadingAccounts(false);
      }
    };

    hydrateBalances();

    return () => {
      mounted = false;
    };
  }, [user?.customerId]);

  // public method to force re-sync
  const syncAccounts = async (): Promise<boolean> => {
    const mapped = await fetchAccountsWithRetry(3);
    if (mapped) {
      setAccounts(mapped);
      try {
        await AsyncStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify(mapped));
      } catch (e) {
        console.warn('Failed to persist accounts cache:', e);
      }
      setIsOffline(false);
      return true;
    }
    setIsOffline(true);
    return false;
  };

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

  const createAccount = async ({ alias, initialBalance = 0, currency = 'MXN' }: CreateAccountPayload): Promise<ActionResult> => {
    if (!alias.trim()) {
      return { success: false, message: 'Asigna un alias a la cuenta.' } as ActionResult;
    }

    // If we have a logged user and are online, call backend
    if (user?.customerId && !isOffline) {
      try {
        const payload = {
          type: 'checking',
          nickname: alias.trim(),
          rewards: 0,
          balance: initialBalance,
        };

        const resp = await paymentsApi.createAccount(user.customerId, payload);

        if (resp.success && resp.objectCreated?._id) {
          const accountId = resp.objectCreated._id;
          try {
            const accountDetails = await paymentsApi.getAccount(accountId);
            const mapped: Account = {
              id: accountDetails._id ?? accountDetails.id ?? accountId,
              alias: accountDetails.nickname ?? alias.trim(),
              number: accountDetails.account_number ? `**** ${String(accountDetails.account_number).slice(-4)}` : createAccountNumber(),
              balance: Number(accountDetails.balance) || initialBalance || 0,
              currency: (accountDetails.currency as CurrencyCode) ?? currency,
              iban: accountDetails.iban ?? undefined,
            };

            setAccounts((prev) => [mapped, ...prev]);
            try {
              await AsyncStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify([mapped, ...accounts]));
            } catch (e) {
              console.warn('Failed to persist accounts cache after create:', e);
            }

            if (initialBalance > 0) {
              pushTransaction({
                type: 'create-account',
                amount: initialBalance,
                currency,
                toAccountId: mapped.id,
                description: 'Saldo inicial',
              });
            }

            return { success: true, message: resp.message ?? 'Cuenta creada correctamente.' };
          } catch (e) {
            // created but fetching details failed - still return success but with note
            setAccounts((prev) => [{ id: accountId, alias: alias.trim(), number: createAccountNumber(), balance: initialBalance, currency, iban: undefined }, ...prev]);
            return { success: true, message: 'Cuenta creada (detalles no disponibles).' };
          }
        }

        return { success: false, message: resp.message || 'Error al crear la cuenta.' };
      } catch (error: any) {
        console.error('createAccount API error:', error);
        // fallback to local behavior
      }
    }

    // fallback local-only creation (offline or no user)
    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      alias: alias.trim(),
      number: createAccountNumber(),
      balance: initialBalance,
      currency,
      iban: createIban(),
    };

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

    try {
      await AsyncStorage.setItem(ACCOUNTS_CACHE_KEY, JSON.stringify([newAccount, ...accounts]));
    } catch (e) {
      console.warn('Failed to persist accounts cache after local create:', e);
    }

    return { success: true, message: 'Cuenta creada correctamente (offline).' };
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
      isLoadingAccounts,
      isOffline,
      syncAccounts,
      createAccount,
      deposit,
      transfer,
    }),
    [accounts, transactions, totalBalance, isLoadingAccounts, isOffline, syncAccounts],
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
