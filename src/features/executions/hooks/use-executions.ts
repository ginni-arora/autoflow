import { useTRPC } from "@/trpc/client";
import { useExecutionsParams } from "./use-executions-params";

export const useSuspenseExecutions = () => {
  const [params] = useExecutionsParams();
  const trpc = useTRPC();
  return trpc.executions.getMany.useSuspenseQuery(params);
};

export const useSuspenseExecution = (executionId: string) => {
  const trpc = useTRPC();
  return trpc.executions.getOne.useSuspenseQuery({ id: executionId });
};