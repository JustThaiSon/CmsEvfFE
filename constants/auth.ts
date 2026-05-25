export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "evf_access_token",
  REFRESH_TOKEN: "evf_refresh_token",
} as const;

/** Matches EVF.Helper.Constants.Globals.ResponseCodeEnum */
export const RESPONSE_CODE = {
  SUCCESS: 200,
  BAD_REQUEST: -400,
  NOT_FOUND: -404,
  ERR_SYSTEM: -500,
} as const;
