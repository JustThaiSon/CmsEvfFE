import { RESPONSE_CODE } from "@/constants/auth";
import type { CommonResponse } from "@/types/api";

export function isApiSuccess<T>(res: CommonResponse<T>): boolean {
  return res.responseCode === RESPONSE_CODE.SUCCESS && res.data != null;
}
