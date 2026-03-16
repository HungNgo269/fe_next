"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

type SafeOptimisticOptions<TData, TVariables, TSnapshot> = {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  getSnapshot: () => TSnapshot;
  applyOptimistic: (variables: TVariables) => void;
  rollback: (snapshot: TSnapshot) => void;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onSettled?: () => void;
  refetchType?: "active" | "inactive" | "all" | "none";
  errorMessage?: string;
};

type MutationContext<TSnapshot> = {
  snapshot: TSnapshot;
};

export function useSafeOptimisticMutation<TData, TVariables, TSnapshot>(
  options: SafeOptimisticOptions<TData, TVariables, TSnapshot>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, MutationContext<TSnapshot>>({
    mutationFn: options.mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      const snapshot = options.getSnapshot();
      options.applyOptimistic(variables);
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      options.rollback(context.snapshot);
      toast.error(options.errorMessage ?? "Unable to complete request.");
    },
    onSuccess: (data, variables) => {
      options.onSuccess?.(data, variables);
    },
    onSettled: () => {
      const refetchType = options.refetchType ?? "inactive";
      void queryClient.invalidateQueries({ queryKey: options.queryKey, refetchType });
      options.onSettled?.();
    },
  });
}
