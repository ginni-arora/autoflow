import { createSearchParamsCache, parseAsInteger } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const executionsParams = createSearchParamsCache({
  page: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE_SIZE),
});