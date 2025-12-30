import { apiClient } from "@/lib/api-client";

const API_URL = import.meta.env.VITE_API_URL1;

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    mid_name?: string;
    email: string;
    role_name?: string;
}

export interface Role {
    id: string;
    name: string;
}

export interface AssignRolePayload {
    user_id: string;
    role_id: string;
    site_id: string;
}

export const userRoleService = {
    listUsers: async (email?: string): Promise<User[]> => {
        const query = email ? `?email=${encodeURIComponent(email)}` : '';
        const response = await apiClient(`${API_URL}v1/user-roles/list_users${query}`);
        return response.json();
    },

    listRoles: async (): Promise<Role[]> => {
        const response = await apiClient(`${API_URL}v1/user-roles/list_role`);
        return response.json();
    },

    assignRole: async (payload: AssignRolePayload): Promise<any> => {
        const response = await apiClient(`${API_URL}v1/user-roles/assign_role`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return response.json();
    },

    removeRole: async (userId: string): Promise<any> => {
        const response = await apiClient(`${API_URL}v1/user-roles/remove_role/${userId}`, {
            method: 'DELETE',
        });
        return response.json();
    },
};
