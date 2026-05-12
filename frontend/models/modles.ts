export interface UserRegister {
  user_name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface UserLogin {
  email: string;
  password: string;
}
