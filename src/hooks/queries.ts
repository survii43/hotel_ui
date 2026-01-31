import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { getActiveMenu, getOrder, createOrder } from '../api/client';
import { queryKeys } from '../api/queryKeys';
import type { CreateOrderRequest, CreateOrderResponse, GetOrderResponse } from '../api/types';

// --- Active menu (outlet menu) – same return as getActiveMenu

type ActiveMenuResponse = Awaited<ReturnType<typeof getActiveMenu>>;

export function useActiveMenu(
  outletId: string | null | undefined,
  options?: { enabled?: boolean } & Omit<UseQueryOptions<ActiveMenuResponse>, 'queryKey' | 'queryFn'>
) {
  const enabled = options?.enabled ?? !!outletId;
  return useQuery({
    queryKey: queryKeys.activeMenu(outletId ?? ''),
    queryFn: () => getActiveMenu(outletId!),
    enabled: enabled && !!outletId,
    staleTime: 5 * 60 * 1000, // 5 min – menu changes infrequently
    gcTime: 10 * 60 * 1000, // 10 min (formerly cacheTime)
    ...options,
  });
}

// --- Order (single order by id)

export function useOrder(
  orderId: string | null | undefined,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  } & Omit<UseQueryOptions<GetOrderResponse>, 'queryKey' | 'queryFn'>
) {
  const enabled = options?.enabled ?? !!orderId;
  return useQuery({
    queryKey: queryKeys.order(orderId ?? ''),
    queryFn: () => getOrder(orderId!),
    enabled: enabled && !!orderId,
    staleTime: 1 * 60 * 1000, // 1 min – order status can change
    gcTime: 5 * 60 * 1000,
    refetchInterval: options?.refetchInterval,
    ...options,
  });
}

// --- Create order (mutation)

export function useCreateOrderMutation(
  options?: Omit<
    UseMutationOptions<CreateOrderResponse, Error, CreateOrderRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();
  const rest = options
    ? Object.fromEntries(Object.entries(options).filter(([k]) => k !== 'onSuccess'))
    : {};
  return useMutation({
    mutationFn: createOrder,
    ...rest,
    onSuccess: (data) => {
      if (data?.order?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.order(data.order.id) });
      }
    },
  });
}
