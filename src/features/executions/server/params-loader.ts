import { executionsParams } from "../params";
import type { SearchParams } from "nuqs/server";

export const executionsParamsLoader = async (searchParams: Promise<SearchParams>) => {
  return executionsParams.parse(await searchParams);
};