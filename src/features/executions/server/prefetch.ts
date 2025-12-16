import { prefetch, trpc } from "@/trpc/routers/server";
import type { inferInput } from "@trpc/tanstack-react-query";

type GetManyInput = inferInput<typeof trpc.executions.getMany>;

export const prefetchExecutions = (params: GetManyInput) => {
  return prefetch(trpc.executions.getMany.queryOptions(params));
};

export const prefetchExecution = (executionId: string) => {
  return prefetch(trpc.executions.getOne.queryOptions({ id: executionId }));
};