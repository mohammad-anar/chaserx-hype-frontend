import { baseApi } from "@/redux/api/baseApi";
import { TAG_TYPES } from "@/constants/api";

export interface AutomationLog {
  id: string;
  orderId: string;
  step: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "SKIPPED";
  details?: any;
  error?: string;
  durationMs?: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  ingredientId: string;
  quantity: number;
  type: "IN" | "OUT" | "RESERVED" | "RELEASED" | "DEDUCTED" | "ADJUSTMENT";
  reason?: string;
  createdAt: string;
  ingredient?: {
    name: string;
    unit: string;
  };
}

export interface OrderAutomationStatusResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    orderId: string;
    orderNumber: string;
    currentStatus: string;
    assignedBarista?: {
      id: string;
      name: string;
      station?: string;
      skillLevel?: number;
    };
    invoice?: {
      id: string;
      invoiceNumber: string;
      subTotal: number;
      total: number;
      taxAmount: number;
      deliveryFee: number;
      serviceCharge: number;
    };
    automationLogs: AutomationLog[];
    stockMovements: StockMovement[];
  };
}

export const automationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderAutomationStatus: builder.query<
      OrderAutomationStatusResponse,
      string
    >({
      query: (orderId) => ({
        url: `/automation/${orderId}`,
        method: "GET",
      }),
      providesTags: [TAG_TYPES.ORDER],
    }),

    retryOrderAutomation: builder.mutation<any, string>({
      query: (orderId) => ({
        url: `/automation/retry/${orderId}`,
        method: "POST",
      }),
      invalidatesTags: [TAG_TYPES.ORDER],
    }),
  }),
});

export const {
  useGetOrderAutomationStatusQuery,
  useRetryOrderAutomationMutation,
} = automationApi;
