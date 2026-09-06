import { User, UserRole } from "@/types";

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

const DEMO_USER: User = {
  id: "user-vivek-001",
  name: "Vivek Sharma",
  email: "vivek@animalsetu.dev",
  role: "PET_OWNER",
  phone: "+91 98765 43210",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
};

class AuthService {
  private currentUser: User = DEMO_USER;

  async getCurrentUser(): Promise<User> {
    return new Promise((resolve) => setTimeout(() => resolve(this.currentUser), 150));
  }

  async login(credentials: LoginCredentials): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = {
          ...DEMO_USER,
          email: credentials.email,
        };
        resolve(this.currentUser);
      }, 300);
    });
  }

  async signup(data: SignupCredentials): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = {
          id: `user-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role,
        };
        resolve(this.currentUser);
      }, 400);
    });
  }

  async switchRole(role: UserRole): Promise<User> {
    this.currentUser = { ...this.currentUser, role };
    return this.currentUser;
  }

  async logout(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 200));
  }
}

export const authService = new AuthService();
