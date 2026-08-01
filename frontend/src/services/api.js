import axios from 'axios';

const API_BASE = '/api/v1';

export const api = {
  // Stats
  getStats: () => axios.get(`${API_BASE}/stats/`).then(res => res.data),

  // Photos
  getPhotos: (params = {}) => axios.get(`${API_BASE}/photos/`, { params }).then(res => res.data),
  getPhotoDetail: (id) => axios.get(`${API_BASE}/photos/${id}`).then(res => res.data),
  getPhotoFileUrl: (id) => `${API_BASE}/photos/${id}/file`,
  uploadPhoto: (formData) => axios.post(`${API_BASE}/photos/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  deletePhoto: (id) => axios.delete(`${API_BASE}/photos/${id}`).then(res => res.data),
  bulkDeleteDuplicates: () => axios.post(`${API_BASE}/photos/bulk-delete-duplicates`).then(res => res.data),

  // Duplicates
  getDuplicateGroups: () => axios.get(`${API_BASE}/duplicates/groups`).then(res => res.data),
  resolveDuplicateGroup: (groupId, keepPhotoId) => 
    axios.post(`${API_BASE}/duplicates/resolve/${groupId}?keep_photo_id=${keepPhotoId}`).then(res => res.data),

  // Categories
  getCategoriesOverview: () => axios.get(`${API_BASE}/categories/`).then(res => res.data),
  getPhotosByCategory: (catId, params = {}) => axios.get(`${API_BASE}/categories/${catId}`, { params }).then(res => res.data),

  // Faces & People
  getPeople: () => axios.get(`${API_BASE}/faces/people`).then(res => res.data),
  getPersonPhotos: (personId) => axios.get(`${API_BASE}/faces/people/${personId}/photos`).then(res => res.data),
  updatePersonName: (personId, name) => axios.put(`${API_BASE}/faces/people/${personId}/name`, { name }).then(res => res.data),

  // Search
  searchPhotos: (payload) => axios.post(`${API_BASE}/search/`, payload).then(res => res.data),

  // Connectors & Datasets
  scanLocalDirectory: (path) => axios.post(`${API_BASE}/connectors/scan-local`, { directory_path: path }).then(res => res.data),
  getGoogleAuthUrl: () => axios.get(`${API_BASE}/connectors/google/auth-url`).then(res => res.data),
  syncGooglePhotos: (email) => axios.post(`${API_BASE}/connectors/google/sync?email=${encodeURIComponent(email)}`).then(res => res.data),
  seedDataset: (scale100k = false) => axios.post(`${API_BASE}/connectors/seed-dataset?scale_100k=${scale100k}`).then(res => res.data)
};
