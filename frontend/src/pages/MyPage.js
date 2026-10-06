import React from 'react';
import EditProfileModal from '../components/EditProfileModal';

export default function MyPage({
  profileSummary,
  isEditingProfile,
  setIsEditingProfile,
  editProfileForm,
  setEditProfileForm,
  handleUpdateProfile,
  setCurrentPage,
  setPrevPage,
  openNotifications,
  openInquiry,
  openInquiryAdmin,
  openSettings,
}) {
  // 관리자 여부는 서버가 내려준다 (이메일을 프론트에 하드코딩하지 않는다)
  const isAdmin = profileSummary.admin === true;
  const goToPage = (page) => {
    setPrevPage('mypage');
    setCurrentPage(page);
    window.history.pushState(null, '', '');
  };

  const openEditModal = () => {
    setEditProfileForm({
      name: profileSummary.user.name,
      department: profileSummary.user.department,
      grade: profileSummary.user.grade,
      profileImage: profileSummary.user.profileImage,
    });
    setIsEditingProfile(true);
  };

  return (
    <div className="flex-1 pb-20 bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-md font-bold">마이페이지</h1>
        <span className="cursor-pointer" onClick={openSettings}>⚙️</span>
      </div>
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={profileSummary.user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <div className="text-base font-bold text-gray-900">{profileSummary.user.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{profileSummary.user.department} | {profileSummary.user.grade}학년</div>
            </div>
          </div>
          <button onClick={openEditModal} className="text-xs text-blue-600 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50">
            프로필 수정
          </button>
        </div>
      </div>

      {isEditingProfile && (
        <EditProfileModal
          form={editProfileForm}
          setForm={setEditProfileForm}
          onCancel={() => setIsEditingProfile(false)}
          onSave={handleUpdateProfile}
        />
      )}

      <div className="grid grid-cols-3 bg-white border-b border-gray-200 text-center py-4 divide-x divide-gray-100">
        <div>
          <div className="text-lg font-bold text-gray-900">{profileSummary.myStudyCount}개</div>
          <div className="text-xs text-gray-400 mt-0.5">내 스터디</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{profileSummary.wishStudyCount}개</div>
          <div className="text-xs text-gray-400 mt-0.5">찜한 스터디</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900">{profileSummary.applyStudyCount}건</div>
          <div className="text-xs text-gray-400 mt-0.5">신청 내역</div>
        </div>
      </div>

      <div className="mt-3 bg-white border-y border-gray-200 divide-y divide-gray-100 text-sm">
        <div onClick={() => goToPage('myCreatedStudies')} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
          <span>내가 만든 스터디</span><span className="text-gray-400">&gt;</span>
        </div>
        <div onClick={() => goToPage('myJoinedStudies')} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
          <span>참여 중인 스터디</span><span className="text-gray-400">&gt;</span>
        </div>
        <div
          onClick={() => goToPage('myWishlistedStudies')}
          className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
        >
          <span>찜 목록</span><span className="text-gray-400">&gt;</span>
        </div>
        <div onClick={openNotifications} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
          <span>알림</span><span className="text-gray-400">&gt;</span>
        </div>
        <div onClick={openInquiry} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
          <span>문의하기</span><span className="text-gray-400">&gt;</span>
        </div>
        {isAdmin && (
          <div onClick={openInquiryAdmin} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <span>문의 관리</span><span className="text-gray-400">&gt;</span>
          </div>
        )}
      </div>
    </div>
  );
}
