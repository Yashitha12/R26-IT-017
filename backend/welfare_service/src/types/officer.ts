export interface Officer {
  officerId: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface OfficerLoginRequest {
  officerId: string;
  password: string;
}

export interface OfficerAuthData {
  officer: Officer;
  token: string;
}

export interface OfficerLoginResponse {
  success: boolean;
  data?: OfficerAuthData;
  error?: string;
}
