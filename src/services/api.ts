const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  // Get auth token from localStorage
  getToken() {
    return localStorage.getItem('token');
  }

  // Set auth token
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  // Remove auth token
  removeToken() {
    localStorage.removeItem('token');
  }

  // Get user data
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Set user data
  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Remove user data
  removeUser() {
    localStorage.removeItem('user');
  }

  // Make API request
  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(email: string, password: string, userType: 'freelancer' | 'business') {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, userType }),
    });

    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }

    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }

    return data;
  }

  async verifyToken() {
    try {
      const data = await this.request('/auth/verify');
      if (data.user) {
        this.setUser(data.user);
      }
      return data;
    } catch (error) {
      this.removeToken();
      this.removeUser();
      throw error;
    }
  }

  logout() {
    this.removeToken();
    this.removeUser();
  }

  // Profile endpoints
  async getProfile() {
    return await this.request('/profile');
  }

  async createFreelancerProfile(profileData: any) {
    return await this.request('/profile/freelancer', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async createBusinessProfile(profileData: any) {
    return await this.request('/profile/business', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getFreelancers() {
    return await this.request('/profile/freelancers');
  }

  async getFreelancer(id: string) {
    return await this.request(`/profile/freelancer/${id}`);
  }
}

export default new ApiService();
