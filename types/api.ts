export interface CommonResponse<T> {
  responseCode: number;
  message: string;
  data?: T;
}
