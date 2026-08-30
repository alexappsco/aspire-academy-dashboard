export interface CrudPermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface EmployeePermissions {
  offers: CrudPermissions;
  profile: CrudPermissions;
  reports: CrudPermissions;
  support: CrudPermissions;
  branches: CrudPermissions;
  packages: CrudPermissions;
  customers: CrudPermissions;
  dashboard: CrudPermissions;
  employees: CrudPermissions;
  wallet?: CrudPermissions;
}

export interface EmployeeUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
  avatar: string | null;
}

export interface EmployeeRole {
  id: string;
  name_ar: string;
  name_en: string;
  permissions: EmployeePermissions;
}

export interface Employee {
  id: string;
  user_id: string;
  owner_user_id: string;
  is_active: boolean;
  role_id: string | null;
  permissions: EmployeePermissions;
  created_at: string;
  user: EmployeeUser;
  role: EmployeeRole | null;
}

export interface EmployeeRoleItem {
  id: string;
  name_ar: string;
  name_en: string;
  permissions: EmployeePermissions;
}

export interface PermissionGroup {
  module: string;
  actions: string[];
}

export interface AvatarData {
  base64: string;
  name: string;
  type: string;
}
