export interface RegisterUserRequest {
  name: string;
  surname?: string;
  secondSurname?: string;
  email: string;
  password: string;
  role: string;
}
