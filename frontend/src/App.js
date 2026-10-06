import React, { useState, useEffect, useRef } from 'react';

import useAuth from './hooks/useAuth';
import useStudy from './hooks/useStudy';
import useNotification from './hooks/useNotification';
import useChat from './hooks/useChat';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import SearchPage from './pages/SearchPage';
import CreateStudyPage from './pages/CreateStudyPage';
import StudyDetailPage from './pages/StudyDetailPage';
import MyPage from './pages/MyPage';
import MyStudyListPage from './pages/MyStudyListPage';
import NotificationPage from './pages/NotificationPage';
import InquiryPage from './pages/InquiryPage';
import InquiryAdminPage from './pages/InquiryAdminPage';
import SettingsPage from './pages/SettingsPage';
import ChatListPage from './pages/ChatListPage';
import ChatRoomPage from './pages/ChatRoomPage';
import NavBar from './components/NavBar';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [prevPage, setPrevPage] = useState(null);

  // useAuth의 자동 로그인 성공 시 studies/profile/categoryStats를 로드해야 하는데,
  // 그 로더들은 useStudy가 만들어야 하고 useStudy는 useAuth가 반환하는 currentUserId가
  // 있어야 생성할 수 있다 (순환 의존). ref에 최신 로더를 담아두고,
  // useAuth 내부의 onAuthStateChanged 콜백에서는 ref를 통해 최신 함수를 호출한다.
  const onAutoLoginLoadersRef = useRef(() => {});

  const {
    currentUserId,
    isLoading,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    registerForm, setRegisterForm,
    handleLogin,
    handleRegister,
    handleLogout,
    handleDeleteAccount,
  } = useAuth(setCurrentPage, (userId) => onAutoLoginLoadersRef.current(userId));

  const study = useStudy(currentUserId, currentPage, setCurrentPage, setPrevPage);
  const notif = useNotification(currentUserId);
  const chat = useChat(currentUserId);
  const leaveChatRoom = chat.leaveRoom;
  const loadChatRooms = chat.loadChatRooms;

  // 매 렌더링마다 최신 클로저로 갱신 (렌더 중 ref 대입은 부수효과가 없어 안전함)
  onAutoLoginLoadersRef.current = (userId) => {
    study.loadStudies();
    study.loadProfile(userId);
    study.loadCategoryStats();
  };

  // 뒤로가기(popstate) 처리: 상세/생성/검색/마이페이지에서 뒤로가기 시 이전 페이지로 복귀
  useEffect(() => {
    const handlePopState = () => {
      if (currentPage === 'detail' || currentPage === 'create' || currentPage === 'search') {
        setCurrentPage(prevPage || 'main');
      } else if (currentPage === 'chatRoom') {
        leaveChatRoom();
        loadChatRooms();
        setCurrentPage('chatList');
      } else if (currentPage === 'chatList') {
        setCurrentPage('main');
      } else if (currentPage === 'mypage') {
        setCurrentPage('main');
      } else if (currentPage === 'myCreatedStudies' || currentPage === 'myJoinedStudies' || currentPage === 'myWishlistedStudies' || currentPage === 'inquiry' || currentPage === 'inquiryAdmin' || currentPage === 'settings') {
        setCurrentPage(prevPage || 'mypage');
      } else if (currentPage === 'notifications') {
        setCurrentPage(prevPage || 'main');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage, prevPage, leaveChatRoom, loadChatRooms]);

  // 하단 네비게이션 바에서 사용하는 페이지 이동 헬퍼
  const navigateTo = (page) => {
    if (page === 'main') {
      study.setSearchKeyword('');
      study.setSelectedCategory('전체');
      study.loadStudies();
      setCurrentPage('main');
      return;
    }
    if (page === 'search') {
      setPrevPage('main');
      study.loadStudies();
      setCurrentPage('search');
      window.history.pushState(null, '', '');
      return;
    }
    if (page === 'create') {
      setCurrentPage('create');
      window.history.pushState(null, '', '');
      return;
    }
    if (page === 'chatList') {
      chat.loadChatRooms();
      setCurrentPage('chatList');
      window.history.pushState(null, '', '');
      return;
    }
    if (page === 'mypage') {
      study.loadProfile(currentUserId);
      setCurrentPage('mypage');
      window.history.pushState(null, '', '');
      return;
    }
  };

  // 채팅방 입장 (목록 또는 스터디 상세에서)
  const openChatRoom = async (room) => {
    try {
      await chat.enterRoom(room);
      setCurrentPage('chatRoom');
      window.history.pushState(null, '', '');
    } catch (err) {
      // 입장 실패 시 (멤버 아님 등) 페이지 이동하지 않음
    }
  };

  // 스터디 상세에서 채팅방 바로가기
  const openChatFromDetail = () => {
    const detail = study.selectedStudyDetail;
    if (!detail) return;
    openChatRoom({
      studyId: detail.id,
      studyTitle: detail.title,
      memberCount: detail.currentParticipants,
      representativeImage: detail.representativeImage,
    });
  };

  const closeChatRoom = () => {
    chat.leaveRoom();
    chat.loadChatRooms();
    setCurrentPage('chatList');
  };

  const openNotifications = () => {
    notif.loadNotifications(currentUserId);
    setPrevPage(currentPage);
    setCurrentPage('notifications');
    window.history.pushState(null, '', '');
  };

  const openInquiry = () => {
    setPrevPage('mypage');
    setCurrentPage('inquiry');
    window.history.pushState(null, '', '');
  };

  const openInquiryAdmin = () => {
    notif.loadAdminInquiries();
    setPrevPage('mypage');
    setCurrentPage('inquiryAdmin');
    window.history.pushState(null, '', '');
  };

  const openSettings = () => {
    setPrevPage('mypage');
    setCurrentPage('settings');
    window.history.pushState(null, '', '');
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-blue-600 text-lg font-bold">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen relative shadow-md flex flex-col font-sans text-gray-800">
      {currentPage === 'login' && (
        <LoginPage
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          handleLogin={handleLogin}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'register' && (
        <RegisterPage
          registerForm={registerForm}
          setRegisterForm={setRegisterForm}
          handleRegister={handleRegister}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'main' && (
        <MainPage
          studies={study.studies}
          selectedCategory={study.selectedCategory}
          selectCategory={study.selectCategory}
          categoryStats={study.categoryStats}
          searchKeyword={study.searchKeyword}
          setSearchKeyword={study.setSearchKeyword}
          handleSearchSubmit={study.handleSearchSubmit}
          viewStudyDetail={study.viewStudyDetail}
          handleToggleWish={study.handleToggleWish}
          currentUserId={currentUserId}
          setCurrentPage={setCurrentPage}
          openNotifications={openNotifications}
        />
      )}

      {currentPage === 'search' && (
        <SearchPage
          studies={study.studies}
          searchKeyword={study.searchKeyword}
          setSearchKeyword={study.setSearchKeyword}
          handleSearchSubmit={study.handleSearchSubmit}
          sortOrder={study.sortOrder}
          setSortOrder={study.changeSortOrder}
          statusFilter={study.statusFilter}
          setStatusFilter={study.changeStatusFilter}
          viewStudyDetail={study.viewStudyDetail}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'create' && (
        <CreateStudyPage
          createForm={study.createForm}
          setCreateForm={study.setCreateForm}
          handleCreateStudy={study.handleCreateStudy}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'detail' && study.selectedStudyDetail && (
        <StudyDetailPage
          selectedStudyDetail={study.selectedStudyDetail}
          openChatFromDetail={openChatFromDetail}
          currentUserId={currentUserId}
          userNames={study.userNames}
          handleToggleWish={study.handleToggleWish}
          handleDeleteStudy={study.handleDeleteStudy}
          handleApproveUser={study.handleApproveUser}
          handleRejectUser={study.handleRejectUser}
          handleKickMember={study.handleKickMember}
          handleApplyStudy={study.handleApplyStudy}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'mypage' && study.profileSummary && (
        <MyPage
          profileSummary={study.profileSummary}
          isEditingProfile={study.isEditingProfile}
          setIsEditingProfile={study.setIsEditingProfile}
          editProfileForm={study.editProfileForm}
          setEditProfileForm={study.setEditProfileForm}
          handleUpdateProfile={study.handleUpdateProfile}
          setCurrentPage={setCurrentPage}
          setPrevPage={setPrevPage}
          openNotifications={openNotifications}
          openInquiry={openInquiry}
          openInquiryAdmin={openInquiryAdmin}
          openSettings={openSettings}
        />
      )}

      {currentPage === 'myCreatedStudies' && (
        <MyStudyListPage
          title="내가 만든 스터디"
          studies={study.userStudies.createdStudies}
          viewStudyDetail={study.viewStudyDetail}
          handleToggleWish={study.handleToggleWish}
          currentUserId={currentUserId}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'myJoinedStudies' && (
        <MyStudyListPage
          title="참여 중인 스터디"
          studies={study.userStudies.joinedStudies}
          viewStudyDetail={study.viewStudyDetail}
          handleToggleWish={study.handleToggleWish}
          currentUserId={currentUserId}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'myWishlistedStudies' && (
        <MyStudyListPage
          title="찜 목록"
          studies={study.userStudies.wishlistedStudies}
          viewStudyDetail={study.viewStudyDetail}
          handleToggleWish={study.handleToggleWish}
          currentUserId={currentUserId}
          setCurrentPage={setCurrentPage}
        />
      )}

      {currentPage === 'notifications' && (
        <NotificationPage
          notifications={notif.notifications}
          markAllNotificationsRead={notif.markAllNotificationsRead}
          markNotificationRead={notif.markNotificationRead}
          onBack={() => setCurrentPage(prevPage || 'main')}
        />
      )}

      {currentPage === 'inquiry' && (
        <InquiryPage
          inquiryForm={notif.inquiryForm}
          setInquiryForm={notif.setInquiryForm}
          handleSubmitInquiry={notif.handleSubmitInquiry}
          onBack={() => setCurrentPage('mypage')}
        />
      )}

      {currentPage === 'inquiryAdmin' && (
        <InquiryAdminPage
          adminInquiries={notif.adminInquiries}
          handleAnswerInquiry={notif.handleAnswerInquiry}
          onBack={() => setCurrentPage('mypage')}
        />
      )}

      {currentPage === 'chatList' && (
        <ChatListPage
          chatRooms={chat.chatRooms}
          openChatRoom={openChatRoom}
          goExplore={() => navigateTo('search')}
        />
      )}

      {currentPage === 'chatRoom' && chat.activeRoom && (
        <ChatRoomPage
          activeRoom={chat.activeRoom}
          messages={chat.messages}
          currentUserId={currentUserId}
          sendMessage={chat.sendMessage}
          isConnected={chat.isConnected}
          onBack={closeChatRoom}
          openStudyDetail={(studyId) => {
            chat.leaveRoom();
            study.viewStudyDetail(studyId);
          }}
        />
      )}

      {currentPage === 'settings' && (
        <SettingsPage
          handleLogout={handleLogout}
          handleDeleteAccount={handleDeleteAccount}
          onBack={() => setCurrentPage('mypage')}
        />
      )}

      {currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'chatRoom' && (
        <NavBar currentPage={currentPage} navigateTo={navigateTo} chatUnreadCount={chat.totalUnread} />
      )}
    </div>
  );
}
