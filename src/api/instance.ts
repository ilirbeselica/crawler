import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Base API configuration
const createApiClient = (baseURL: string, token?: string): AxiosInstance => {
  const config: AxiosRequestConfig = {
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  const instance = axios.create(config);
  
  // Add request interceptor for logging or modifications
  instance.interceptors.request.use(
    (config) => {
      // Log or modify request
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API request failed:', error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create API clients for different services
export const dashboardApi = createApiClient(
  process.env.DASHBOARD_API_URL || 'http://localhost',
  process.env.DASHBOARD_API_TOKEN
);

// Export helper functions for common API operations
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await dashboardApi.get(url, config);
  return response.data;
}

export async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await dashboardApi.post(url, data, config);
  return response.data;
}

export async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await dashboardApi.put(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await dashboardApi.delete(url, config);
  return response.data;
}