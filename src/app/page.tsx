import { requireAuth } from "@/lib/auth-utils";
import { createCallerFactory } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { createTRPCContext } from "@/trpc/init";
import { LogoutButton } from "./logout";

const Page = async () => {
  await requireAuth();

  const createCaller = createCallerFactory(appRouter);
  const caller = createCaller(await createTRPCContext());
  const data = await caller.getUsers();

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center flex-col gap-y-6">
      protected server component
      <div>
        {JSON.stringify(data, null, 2)}
      </div>
      <LogoutButton />
    </div>
  );
};

export default Page;
