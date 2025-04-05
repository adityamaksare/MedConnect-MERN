import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define logout first since it's used in validateUserSession
  const logout = useCallback(() => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  }, []);

  // Validate user session with the server
  const validateUserSession = useCallback(async (user) => {
    try {
      // Make a request to get the user profile to validate the token
      await api.get('/users/profile');
      // If successful, token is valid
    } catch (err) {
      console.error('Session validation failed:', err);
      // If token is invalid, clear user info
      logout();
    }
  }, [logout]);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Input validation
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        throw new Error('Email and password are required');
      }

      const response = await api.post('/users/login', { email, password });

      // Backend returns the user data directly, not within a 'user' property
      const userData = response.data;

      if (userData && userData.token) {
        // Add a role property based on isDoctor status
        userData.role = userData.isDoctor ? 'doctor' : 'patient';

        setUserInfo(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        return userData;
      } else {
        console.error('Invalid response format - no token found');
        setError('Login failed: Invalid response from server');
        throw new Error('Invalid response format - no token found');
      }
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);

      // Clear any previous user data just in case
      setUserInfo(null);
      localStorage.removeItem('userInfo');

      // Set specific error message based on response
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/users', userData);

      // Backend returns the user data directly
      const newUser = response.data;

      if (newUser && newUser.token) {
        // Add a role property based on isDoctor status
        newUser.role = newUser.isDoctor ? 'doctor' : 'patient';

        // Verify the user was written to the database
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to allow DB write
          const verifyResponse = await api.get('/users/verify-db');

          if (!verifyResponse.data.success) {
            console.warn('Could not verify database write, but registration succeeded');
          }
        } catch (verifyErr) {
          console.warn('Error verifying database write:', verifyErr);
          // Continue anyway since registration succeeded
        }

        setUserInfo(newUser);
        localStorage.setItem('userInfo', JSON.stringify(newUser));
        return newUser;
      } else {
        throw new Error('Invalid response format - no token found');
      }
    } catch (err) {
      console.error('Register error:', err.response ? err.response.data : err.message);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'An unexpected error occurred'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put('/users/profile', userData);

      // Backend returns the updated user data directly
      const updatedUser = response.data;

      if (updatedUser && updatedUser.token) {
        // Add a role property based on isDoctor status
        updatedUser.role = updatedUser.isDoctor ? 'doctor' : 'patient';

        setUserInfo(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        return updatedUser;
      } else {
        throw new Error('Invalid response format - no token found');
      }
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'An unexpected error occurred'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const parsedUser = JSON.parse(storedUserInfo);
          // If we have a token, verify it's valid by making an API call
          if (parsedUser && parsedUser.token) {
            // Ensure the role property is set based on isDoctor
            if (parsedUser.isDoctor !== undefined && parsedUser.role === undefined) {
              parsedUser.role = parsedUser.isDoctor ? 'doctor' : 'patient';
              localStorage.setItem('userInfo', JSON.stringify(parsedUser));
            }

            setUserInfo(parsedUser);
            // Optionally verify token validity with the server
            validateUserSession(parsedUser);
          } else {
            // No valid token, clear storage
            localStorage.removeItem('userInfo');
          }
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, [validateUserSession]);

  const value = {
    userInfo,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!userInfo,
    isDoctor: userInfo?.isDoctor === true,
    isPatient: userInfo?.isDoctor === false,
    isAdmin: userInfo?.isAdmin === true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};