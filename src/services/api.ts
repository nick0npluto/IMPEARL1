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
  async register(email: string, password: string, userType: 'freelancer' | 'business' | 'service_provider') {
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

  async createServiceProviderProfile(profileData: any) {
    return await this.request('/profile/service-provider', {
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

  async getServiceProviders() {
    return await this.request('/profile/service-providers');
  }

  async getServiceProvider(id: string) {
    return await this.request(`/profile/service-provider/${id}`);
  }

  // Engagements & contracts
  async createEngagement(payload: any) {
    return await this.request('/engagements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getEngagements() {
    return await this.request('/engagements/my');
  }

  async acceptEngagement(id: string) {
    return await this.request(`/engagements/${id}/accept`, {
      method: 'POST',
    });
  }

  async declineEngagement(id: string) {
    return await this.request(`/engagements/${id}/decline`, {
      method: 'POST',
    });
  }

  async counterEngagement(id: string, payload: { price: number; terms: string }) {
    return await this.request(`/engagements/${id}/counter`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getContracts() {
    return await this.request('/contracts/my');
  }

  async completeContract(id: string) {
    return await this.request(`/contracts/${id}/complete`, {
      method: 'POST',
    });
  }

  async createPayment(payload: { contractId: string; amount: number }) {
    return await this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getNotifications() {
    return await this.request('/notifications/my');
  }

  async markNotificationRead(id: string) {
    return await this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async getMessages(contractId: string) {
    const params = new URLSearchParams({ contractId });
    return await this.request(`/messages?${params.toString()}`);
  }

  async sendMessage(payload: { contractId: string; body: string; receiverId: string }) {
    return await this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async startQnaSession(answers: Record<string, any>) {
    return await this.request('/qna/start', {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async updateQnaSession(sessionId: string, payload: { answers?: Record<string, any>; derivedTags?: string[] }) {
    return await this.request(`/qna/${sessionId}/answers`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async sendSupportMessage(messages: Array<{ role: string; content: string }>) {
    return await this.request('/support/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async getLatestQnaSession() {
    return await this.request('/qna/latest');
  }

  // Favorites/Bookmarks methods (currently using localStorage)
  // TODO: Replace with backend API calls when ready
  
  getFavoritesFromStorage() {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  }

  saveFavoritesToStorage(favorites: string[]) {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  addFavorite(freelancerId: string) {
    const favorites = this.getFavoritesFromStorage();
    if (!favorites.includes(freelancerId)) {
      favorites.push(freelancerId);
      this.saveFavoritesToStorage(favorites);
    }
    return favorites;
  }

  removeFavorite(freelancerId: string) {
    const favorites = this.getFavoritesFromStorage();
    const newFavorites = favorites.filter((id: string) => id !== freelancerId);
    this.saveFavoritesToStorage(newFavorites);
    return newFavorites;
  }

  isFavorite(freelancerId: string) {
    const favorites = this.getFavoritesFromStorage();
    return favorites.includes(freelancerId);
  }

  clearAllFavorites() {
    this.saveFavoritesToStorage([]);
    return [];
  }

  async getBookmarkedFreelancers() {
    const favoriteIds = this.getFavoritesFromStorage();
    
    if (favoriteIds.length === 0) {
      return { success: true, freelancers: [] };
    }

    // Fetch all freelancers
    const response = await this.getFreelancers();
    
    if (response.success) {
      // Filter to only favorited ones
      const bookmarked = response.freelancers.filter((f: any) =>
        favoriteIds.includes(f._id)
      );
      return { success: true, freelancers: bookmarked };
    }

    return { success: false, freelancers: [] };
  }
}

export default new ApiService();
