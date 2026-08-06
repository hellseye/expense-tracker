export type Resource =
  | "Expense"
  | "Category"
  | "Analytics"
  | "Dashboard"
  | "Profile"
  | "Settings";

export type Action = "CREATE" | "READ" | "UPDATE" | "DELETE";

export interface Permission {
  resource: Resource;
  actions: Action[];
}

export class PermissionSystem {
  static getPermissionsForRole(role: string = "USER"): Permission[] {
    if (role === "ADMIN") {
      return [
        { resource: "Expense", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
        { resource: "Category", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
        { resource: "Analytics", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
        { resource: "Dashboard", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
        { resource: "Profile", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
        { resource: "Settings", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
      ];
    }

    // Default USER Permissions
    return [
      { resource: "Expense", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
      { resource: "Category", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
      { resource: "Analytics", actions: ["READ"] },
      { resource: "Dashboard", actions: ["READ"] },
      { resource: "Profile", actions: ["READ", "UPDATE"] },
      { resource: "Settings", actions: ["READ", "UPDATE"] },
    ];
  }
}
