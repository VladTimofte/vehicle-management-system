type Role = 'admin' | 'manager' | 'hr';

type RolePermissions = {
  [key in Role]: string[];
};

export const rolePermissions: RolePermissions = {
  admin: [
    'read:allocations',
    'read:employees',
    'read:history',
    'read:vehicles',
    'write:allocations',
    'write:employees',
    'write:history',
    'write:vehicles',
  ],
  manager: [
    'read:history',
    'read:vehicles',
    'write:vehicles',
  ],
  hr: [
    'read:allocations',
    'read:employees',
    'write:allocations',
    'write:employees',
  ],
};
