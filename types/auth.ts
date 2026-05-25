export interface LoginReq {
  userName?: string;
  password?: string;
}

export interface LoginRes {
  accessToken?: string;
  refreshToken?: string;
}
