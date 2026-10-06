import { useState } from 'react';
import * as studyApi from '../api/studyApi';

/**
 * 알림/문의하기 도메인 상태와 로직을 관리하는 훅
 *
 * @param {string} currentUserId - useAuth에서 전달받은 현재 사용자 ID
 */
export default function useNotification(currentUserId) {
  const [notifications, setNotifications] = useState([]);
  const [inquiryForm, setInquiryForm] = useState({ title: '', content: '' });
  const [adminInquiries, setAdminInquiries] = useState([]);

  const loadNotifications = async (userId) => {
    try {
      const res = await studyApi.fetchNotifications(userId || currentUserId);
      setNotifications(res.data);
    } catch (err) {
      console.error('알림 목록 로드 오류', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await studyApi.markAllNotificationsRead(currentUserId);
      loadNotifications(currentUserId);
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await studyApi.markNotificationRead(id);
      loadNotifications(currentUserId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    try {
      await studyApi.submitInquiry({
        userId: currentUserId,
        title: inquiryForm.title,
        content: inquiryForm.content,
      });
      alert('문의가 접수되었습니다!');
      setInquiryForm({ title: '', content: '' });
      loadNotifications(currentUserId);
      return true;
    } catch (err) {
      alert('문의 접수에 실패했습니다.');
      return false;
    }
  };

  const loadAdminInquiries = async () => {
    try {
      const res = await studyApi.fetchAllInquiries(currentUserId);
      setAdminInquiries(res.data);
    } catch (err) {
      console.error('문의 목록 로드 오류', err);
    }
  };

  const handleAnswerInquiry = async (id, answer) => {
    try {
      await studyApi.answerInquiry(id, currentUserId, answer);
      alert('답변이 등록되었습니다!');
      loadAdminInquiries();
    } catch (err) {
      alert(err.response?.data || '답변 등록에 실패했습니다.');
    }
  };

  return {
    notifications,
    loadNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    inquiryForm, setInquiryForm,
    handleSubmitInquiry,
    adminInquiries,
    loadAdminInquiries,
    handleAnswerInquiry,
  };
}
