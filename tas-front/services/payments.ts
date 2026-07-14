import { api } from './api';

export interface CreatePledgeDto {
  amount: number;
  rewardId?: string;
}

export interface CreatePledgeResponse {
  pledgeId: string;
  paypalOrderId: string;
  approvalUrl: string;
  status: string;
}

export interface CapturePaymentDto {
  orderId: string;
}

export interface PaymentResponse {
  id: string;
  amount: string;
  status: string;
  transactionId: string;
  paypalOrderId: string;
  createdAt: string;
  project: { id: string; title: string; raisedAmount: number };
  user: { id: string; firstName: string; lastName?: string };
  reward?: { id: string; description: string };
}

export interface PledgeHistoryResponse {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  project: { id: string; title: string; targetAmount: number };
  reward?: { id: string; description: string };
}

export interface ProjectPledgeResponse {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  reward?: { id: string; description: string };
}

export const paymentsService = {
  createPledge: async (projectId: string, data: CreatePledgeDto): Promise<CreatePledgeResponse> => {
    const response = await api.post(`/payments/projects/${projectId}/pledge`, data);
    return response.data;
  },

  capturePayment: async (data: CapturePaymentDto): Promise<PaymentResponse> => {
    const response = await api.post('/payments/capture', data);
    return response.data;
  },

  getMyPledges: async (): Promise<PledgeHistoryResponse[]> => {
    const response = await api.get('/payments/me/pledges');
    return response.data;
  },

  getProjectPledges: async (projectId: string): Promise<ProjectPledgeResponse[]> => {
    const response = await api.get(`/payments/projects/${projectId}/pledges`);
    return response.data;
  },
};
