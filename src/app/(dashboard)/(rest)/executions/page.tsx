import { ExecutionsContainer, ExecutionsList, ExecutionsLoading, ExecutionsError, ExecutionsPagination } from "@/features/executions/components/executions";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import type { SearchParams } from "nuqs/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ExecutionsPage({ searchParams }: Props) {
  await requireAuth();
  const params = await executionsParamsLoader(searchParams);

  prefetchExecutions(params);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full">
        <ExecutionsContainer>
          <HydrateClient>
            <ErrorBoundary fallback={<ExecutionsError />}>
              <Suspense fallback={<ExecutionsLoading />}>
                <ExecutionsList />
                <ExecutionsPagination />
              </Suspense>
            </ErrorBoundary>
          </HydrateClient>
        </ExecutionsContainer>
      </div>
    </div>
  );
}