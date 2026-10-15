export type LoginFormValues = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: number;
  email: string;
  fullName: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};

export type LoginResult =
  | { success: true; data: LoginResponse }
  | { success: false; error: string };
