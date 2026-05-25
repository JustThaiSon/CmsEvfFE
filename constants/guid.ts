export const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

export function isValidGuid(id?: string | null): boolean {
  return !!id && id !== EMPTY_GUID;
}
