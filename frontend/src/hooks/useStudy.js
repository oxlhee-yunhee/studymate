import { useState } from 'react';
import * as studyApi from '../api/studyApi';

/**
 * 스터디/프로필 도메인 상태와 로직을 관리하는 훅
 *
 * @param {string} currentUserId - useAuth에서 전달받은 현재 사용자 ID
 * @param {string} currentPage - App.js가 소유하는 현재 페이지 (상세 진입 시 이전 페이지 기억용)
 * @param {function} setCurrentPage - 페이지 이동 setter
 * @param {function} setPrevPage - 상세/검색/생성 페이지 진입 전 페이지를 기억하기 위한 setter
 */
export default function useStudy(currentUserId, currentPage, setCurrentPage, setPrevPage) {
  const [studies, setStudies] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [sortOrder, setSortOrder] = useState('최신순');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [categoryStats, setCategoryStats] = useState({});
  const [profileSummary, setProfileSummary] = useState(null);
  const [userStudies, setUserStudies] = useState({
    createdStudies: [],
    joinedStudies: [],
    wishlistedStudies: [],
  });
  const [userNames, setUserNames] = useState({});
  const [selectedStudyId, setSelectedStudyId] = useState(null);
  const [selectedStudyDetail, setSelectedStudyDetail] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    department: '',
    grade: 1,
    profileImage: '',
  });
  const [createForm, setCreateForm] = useState({
    title: '',
    category: '전공',
    representativeImage: '',
    introduction: '',
    progressMethod: '온라인',
    startDate: '',
    endDate: '',
    isAlwaysOpen: false,
    startTime: '',
    endTime: '',
    joinCondition: '',
    isTimeUnknown: false,
    location: '',
    maxParticipants: 5,
    tags: [],
    customTag: '',
  });

  const loadStudies = async (params) => {
    try {
      const res = await studyApi.fetchStudies(
        params || { sort: sortOrder, status: statusFilter, keyword: searchKeyword, category: selectedCategory }
      );
      setStudies(res.data);
    } catch (err) {
      console.error('스터디 목록 로드 오류', err);
    }
  };

  const selectCategory = (category) => {
    setSelectedCategory(category);
    loadStudies({ sort: sortOrder, status: statusFilter, keyword: searchKeyword, category });
  };

  const changeSortOrder = (sort) => {
    setSortOrder(sort);
    loadStudies({ sort, status: statusFilter, keyword: searchKeyword, category: selectedCategory });
  };

  const changeStatusFilter = (status) => {
    setStatusFilter(status);
    loadStudies({ sort: sortOrder, status, keyword: searchKeyword, category: selectedCategory });
  };

  const loadCategoryStats = async () => {
    try {
      const res = await studyApi.fetchCategoryStats();
      setCategoryStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProfile = async (userId) => {
    try {
      const profRes = await studyApi.fetchProfile(userId);
      setProfileSummary(profRes.data);
      const studyRes = await studyApi.fetchUserStudies(userId);
      setUserStudies(studyRes.data);
    } catch (err) {
      console.error('프로필 데이터 로드 오류', err);
    }
  };

  const loadUserName = async (userId) => {
    if (userNames[userId]) return;
    try {
      const res = await studyApi.fetchUserInfo(userId);
      setUserNames((prev) => ({ ...prev, [userId]: res.data.name }));
    } catch (err) {
      setUserNames((prev) => ({ ...prev, [userId]: userId }));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudies();
    setCurrentPage('search');
  };

  const handleCreateStudy = async (e) => {
    e.preventDefault();
    const schedule = createForm.isAlwaysOpen
      ? '상시 모집'
      : `${createForm.startDate} ~ ${createForm.endDate}`;
    const timeInfo = createForm.isTimeUnknown
      ? '시간 미정'
      : `${createForm.startTime} ~ ${createForm.endTime}`;
    const payload = {
      ...createForm,
      creatorId: currentUserId,
      tagList: createForm.tags,
      schedule,
      timeInfo,
      currentParticipants: 1,
      representativeImage:
        createForm.representativeImage ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    };
    try {
      await studyApi.createStudy(payload);
      alert('스터디가 생성되었습니다!');
      setCreateForm({
        title: '', category: '전공', representativeImage: '',
        introduction: '', progressMethod: '온라인', startDate: '',
        endDate: '', isAlwaysOpen: false, startTime: '', endTime: '',
        isTimeUnknown: false, joinCondition: '', location: '',
        maxParticipants: 5, tags: [], customTag: '',
      });
      loadStudies();
      loadProfile(currentUserId);
      setCurrentPage('main');
    } catch (err) {
      alert('생성에 실패했습니다.');
    }
  };

  const handleDeleteStudy = async (studyId) => {
    if (!window.confirm('정말 스터디를 삭제하시겠습니까?')) return;
    try {
      await studyApi.deleteStudy(studyId, currentUserId);
      alert('스터디가 삭제되었습니다.');
      loadStudies();
      setCurrentPage('main');
    } catch (err) {
      alert(err.response?.data || '삭제에 실패했습니다.');
    }
  };

  const viewStudyDetail = async (id) => {
    try {
      const res = await studyApi.fetchStudyDetail(id);
      setSelectedStudyDetail(res.data);
      setSelectedStudyId(id);
      setPrevPage(currentPage);
      setCurrentPage('detail');
      window.history.pushState(null, '', '');
      res.data.participantIds?.forEach((uid) => loadUserName(uid));
      res.data.pendingUserIds?.forEach((uid) => loadUserName(uid));
    } catch (err) {
      alert('상세 정보를 가져올 수 없습니다.');
    }
  };

  const handleApplyStudy = async (id) => {
    try {
      const res = await studyApi.applyStudy(id, currentUserId);
      setSelectedStudyDetail(res.data);
      alert('스터디 신청이 완료되었습니다!');
      loadProfile(currentUserId);
    } catch (err) {
      alert(err.response?.data || '신청에 실패했습니다.');
    }
  };

  const handleToggleWish = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await studyApi.toggleWish(id, currentUserId);
      loadStudies();
      loadProfile(currentUserId);
      if (currentPage === 'detail') {
        const res = await studyApi.fetchStudyDetail(id);
        setSelectedStudyDetail(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveUser = async (studyId, userId) => {
    try {
      const res = await studyApi.approveUser(studyId, currentUserId, userId);
      setSelectedStudyDetail(res.data);
      alert('승인되었습니다!');
    } catch (err) {
      alert(err.response?.data || '승인에 실패했습니다.');
    }
  };

  const handleRejectUser = async (studyId, userId) => {
    try {
      const res = await studyApi.rejectUser(studyId, currentUserId, userId);
      setSelectedStudyDetail(res.data);
      alert('거절되었습니다.');
    } catch (err) {
      alert(err.response?.data || '거절에 실패했습니다.');
    }
  };

  const handleKickMember = async (studyId, userId) => {
    if (!window.confirm('정말 내보내시겠습니까?')) return;
    try {
      const res = await studyApi.kickMember(studyId, currentUserId, userId);
      setSelectedStudyDetail(res.data);
      alert('내보내기 완료되었습니다.');
    } catch (err) {
      alert(err.response?.data || '내보내기에 실패했습니다.');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await studyApi.updateProfile(currentUserId, editProfileForm);
      setProfileSummary((prev) => ({ ...prev, user: res.data }));
      setIsEditingProfile(false);
      alert('프로필이 수정되었습니다!');
    } catch (err) {
      alert('프로필 수정에 실패했습니다.');
    }
  };

  return {
    // 목록/검색/필터
    studies,
    searchKeyword, setSearchKeyword,
    selectedCategory, setSelectedCategory, selectCategory,
    sortOrder, changeSortOrder,
    statusFilter, changeStatusFilter,
    categoryStats,
    // 프로필/유저
    profileSummary,
    userStudies,
    userNames,
    isEditingProfile, setIsEditingProfile,
    editProfileForm, setEditProfileForm,
    // 상세
    selectedStudyId,
    selectedStudyDetail,
    // 생성 폼
    createForm, setCreateForm,
    // 로더
    loadStudies,
    loadCategoryStats,
    loadProfile,
    loadUserName,
    // 핸들러
    handleSearchSubmit,
    handleCreateStudy,
    handleDeleteStudy,
    viewStudyDetail,
    handleApplyStudy,
    handleToggleWish,
    handleApproveUser,
    handleRejectUser,
    handleKickMember,
    handleUpdateProfile,
  };
}
