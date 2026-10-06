// src/api/studyApi.js
import axios from 'axios';
import { auth } from '../firebase';

// 배포 시 .env의 REACT_APP_API_BASE 로 백엔드 주소를 지정한다.
// 예) REACT_APP_API_BASE=https://studymate-api-xxxx.a.run.app/api
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080/api';

// 모든 요청에 Firebase ID 토큰을 자동으로 붙인다.
// (서버는 이 토큰으로만 사용자를 식별하며, userId 파라미터는 더 이상 신뢰하지 않는다)
axios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
      console.error('ID 토큰 발급 실패', e);
    }
  }
  return config;
});

// ── Auth ──────────────────────────────────────────
export const ssoLogin = (idToken, email, extra = {}) =>
  axios.post(`${API_BASE}/auth/sso`, { idToken, email, ...extra });

// ── Studies ───────────────────────────────────────
export const fetchStudies = (params) =>
  axios.get(`${API_BASE}/studies`, { params });

export const fetchStudyDetail = (id) =>
  axios.get(`${API_BASE}/studies/${id}`);

export const createStudy = (payload) =>
  axios.post(`${API_BASE}/studies`, payload);

export const deleteStudy = (studyId, creatorId) =>
  axios.delete(`${API_BASE}/studies/${studyId}?creatorId=${creatorId}`);

export const applyStudy = (studyId, userId) =>
  axios.post(`${API_BASE}/studies/${studyId}/apply?userId=${userId}`);

export const toggleWish = (studyId, userId) =>
  axios.post(`${API_BASE}/studies/${studyId}/wish?userId=${userId}`);

export const approveUser = (studyId, creatorId, userId) =>
  axios.post(`${API_BASE}/studies/${studyId}/approve?creatorId=${creatorId}&userId=${userId}`);

export const rejectUser = (studyId, creatorId, userId) =>
  axios.post(`${API_BASE}/studies/${studyId}/reject?creatorId=${creatorId}&userId=${userId}`);

export const kickMember = (studyId, creatorId, userId) =>
  axios.post(`${API_BASE}/studies/${studyId}/kick?creatorId=${creatorId}&userId=${userId}`);

export const fetchCategoryStats = () =>
  axios.get(`${API_BASE}/studies/categories/stats`);

// ── Users ─────────────────────────────────────────
export const fetchProfile = (userId) =>
  axios.get(`${API_BASE}/users/${userId}/profile`);

export const fetchUserStudies = (userId) =>
  axios.get(`${API_BASE}/users/${userId}/studies`);

export const fetchUserInfo = (userId) =>
  axios.get(`${API_BASE}/users/${userId}/info`);

export const updateProfile = (userId, profileForm) =>
  axios.put(`${API_BASE}/users/${userId}/profile`, profileForm);

export const deleteAccount = (userId) =>
  axios.delete(`${API_BASE}/users/${userId}`);

// ── Notifications ─────────────────────────────────
export const fetchNotifications = (userId) =>
  axios.get(`${API_BASE}/notifications/${userId}`);

export const markNotificationRead = (id) =>
  axios.post(`${API_BASE}/notifications/${id}/read`);

export const markAllNotificationsRead = (userId) =>
  axios.post(`${API_BASE}/notifications/${userId}/read-all`);

// ── Chat ──────────────────────────────────────────
export const fetchChatRooms = (userId) =>
  axios.get(`${API_BASE}/chat/rooms`, { params: { userId } });

export const fetchChatMessages = (studyId, userId) =>
  axios.get(`${API_BASE}/chat/rooms/${studyId}/messages`, { params: { userId } });

export const markChatRead = (studyId, userId) =>
  axios.post(`${API_BASE}/chat/rooms/${studyId}/read?userId=${userId}`);

export const fetchTotalUnreadCount = (userId) =>
  axios.get(`${API_BASE}/chat/unread-count`, { params: { userId } });

// ── Inquiries ──────────────────────────────────────
export const submitInquiry = (payload) =>
  axios.post(`${API_BASE}/inquiries`, payload);

export const fetchAllInquiries = (requesterId) =>
  axios.get(`${API_BASE}/inquiries`, { params: { requesterId } });

export const answerInquiry = (id, requesterId, answer) =>
  axios.post(`${API_BASE}/inquiries/${id}/answer`, { requesterId, answer });