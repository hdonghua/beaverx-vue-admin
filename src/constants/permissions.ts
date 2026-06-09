/** 与后端 RbacPermissionCodes 保持一致 */
export const SuperAdmin = 'super_admin';

export const Permissions = {
  System: {
    User: {
      List: 'system:user:list',
      Create: 'system:user:create',
      Update: 'system:user:update',
      Delete: 'system:user:delete',
      AssignRoles: 'system:user:assign_roles',
      ResetPassword: 'system:user:reset_password',
    },
    Role: {
      List: 'system:role:list',
      Create: 'system:role:create',
      Update: 'system:role:update',
      Delete: 'system:role:delete',
      AssignMenus: 'system:role:assign_menus',
    },
    Menu: {
      List: 'system:menu:list',
      Create: 'system:menu:create',
      Update: 'system:menu:update',
      Delete: 'system:menu:delete',
    },
    Dict: {
      List: 'system:dict:list',
      Type: {
        Create: 'system:dict_type:create',
        Update: 'system:dict_type:update',
        Delete: 'system:dict_type:delete',
      },
      Data: {
        Create: 'system:dict_data:create',
        Update: 'system:dict_data:update',
        Delete: 'system:dict_data:delete',
      },
    },
    Config: {
      List: 'system:config:list',
      Create: 'system:config:create',
      Update: 'system:config:update',
      Delete: 'system:config:delete',
    },
    Message: {
      Send: 'system:message:send',
    },
  },
  Payment: {
    Channel: {
      List: 'payment:channel:list',
      Create: 'payment:channel:create',
      Update: 'payment:channel:update',
      Delete: 'payment:channel:delete',
    },
    Order: {
      List: 'payment:order:list',
      Create: 'payment:order:create',
      Query: 'payment:order:query',
      Close: 'payment:order:close',
      Refund: 'payment:order:refund',
      SandboxPay: 'payment:order:sandbox_pay',
    },
    Refund: {
      List: 'payment:refund:list',
    },
  },
} as const;
