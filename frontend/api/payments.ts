import apiClient from './index';

export type TransferRequest = {
  payer_id: string;
  medium: string;
  payee_id: string;
  amount: number;
  description?: string;
};

export type TransferResponse = {
  success: boolean;
  result?: any;
  message?: string;
};

export type CreateAccountRequest = {
  type: string;
  nickname: string;
  rewards: number;
  balance: number;
  account_number?: string;
};

export type CreateAccountResponse = {
  success: boolean;
  message?: string;
  objectCreated?: any;
};

/**
 * Create a transfer between accounts
 * Uses the /payments/transfer endpoint
 */
export const createTransfer = async (
  data: TransferRequest
): Promise<TransferResponse> => {
  try {
    const response = await apiClient.post<TransferResponse>(
      '/payments/transfer',
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Transfer error:', error);
    return {
      success: false,
      message: error.response?.data?.detail || error.response?.data?.message || 'Error al realizar la transferencia.',
    };
  }
};

/**
 * Create a new account for a customer
 */
export const createAccount = async (
  customerId: string,
  data: CreateAccountRequest
): Promise<CreateAccountResponse> => {
  try {
    const response = await apiClient.post<CreateAccountResponse>(
      `/api/payments/customers/${customerId}/accounts`,
      data
    );
    return response.data;
  } catch (error: any) {
    console.error('Create account error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al crear la cuenta.',
    };
  }
};

/**
 * Get accounts for a customer
 */
export const getAccounts = async (customerId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/payments/customers/${customerId}/accounts`);
    return response.data;
  } catch (error: any) {
    console.error('Get accounts error:', error);
    throw error;
  }
};

/**
 * Get account details
 */
export const getAccount = async (accountId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/payments/accounts/${accountId}`);
    return response.data;
  } catch (error: any) {
    console.error('Get account error:', error);
    throw error;
  }
};

/**
 * Get transfers for an account
 */
export const getTransfers = async (accountId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/payments/accounts/${accountId}/transfers`);
    return response.data;
  } catch (error: any) {
    console.error('Get transfers error:', error);
    throw error;
  }
};
