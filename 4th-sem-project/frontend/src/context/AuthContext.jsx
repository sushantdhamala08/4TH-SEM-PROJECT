import { createContext, useContext, useState } from 'react';
import api from '@/api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure role defaults to student if it's an old session missing the role
        if (!parsedUser.role) {
          parsedUser.role = 'student';
        }
        return parsedUser;
      }
      return null;
    } catch (e) {
      console.error("Failed to parse user data", e);
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login.php', { email, password });
      
      if (data.success) {
        // Save token
        localStorage.setItem('token', data.token);
        
        // Save user object (which now includes { id, name, email, role })
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        return { success: true, role: data.user.role };
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Server error occurred during login." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);