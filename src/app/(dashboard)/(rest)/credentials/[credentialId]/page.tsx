import { requireAuth } from "@/lib/auth-utils";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { HydrateClient } from "@/trpc/routers/server";
import { ErrorBoundary } from "@sentry/nextjs";
import { Suspense } from "react";
import { CredentialView } from "@/features/credentials/components/credential";
import { CredentialsLoading, CredentialsError } from "@/features/credentials/components/credentials";

type Props = {
  params: Promise<{ credentialId: string }>;
};

const Page = async ({ params }: Props) => {
  await requireAuth();
  const { credentialId } = await params;

  prefetchCredential(credentialId);

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full">
        <HydrateClient>
          <ErrorBoundary fallback={<CredentialsError />}>
            <Suspense fallback={<CredentialsLoading />}>
              <CredentialView credentialId={credentialId} />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>
      </div>
    </div>
  );
};

export default Page;