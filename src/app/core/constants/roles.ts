export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  COMPANY_USER = 'COMPANY_USER',
}

export interface RoleOption {
  value: RolesEnum;
  label: string;
}

export const ROLES: RoleOption[] = [
  { value: RolesEnum.ADMIN, label: 'Administrador' },
  { value: RolesEnum.USER, label: 'Usuario' },
  { value: RolesEnum.COMPANY_ADMIN, label: 'Administrador de Compañía' },
  { value: RolesEnum.COMPANY_USER, label: 'Usuario de Compañía' },
];
