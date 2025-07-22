
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'dealer' | 'user';
}

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response based on email
    if (email === 'admin@example.com') {
      return {
        user: {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        },
        token: 'mock-admin-token'
      };
    } else if (email === 'dealer@example.com') {
      return {
        user: {
          id: '2',
          email: 'dealer@example.com',
          name: 'Dealer User',
          role: 'dealer'
        },
        token: 'mock-dealer-token'
      };
    }
    throw new Error('Invalid credentials');
  },

  forgotPassword: async (email: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In real implementation, this would trigger password reset email
    console.log('Password reset email sent to:', email);
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password reset successful');
  }
};
