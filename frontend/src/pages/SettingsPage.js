import React from 'react';

export default function SettingsPage({ handleLogout, handleDeleteAccount, onBack }) {
  return (
    <div className="flex-1 pb-20 bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-2 sticky top-0 z-10">
        <button onClick={onBack} className="text-lg">←</button>
        <h1 className="text-md font-bold">설정</h1>
      </div>
      <div className="mt-3 bg-white border-y border-gray-200 divide-y divide-gray-100 text-sm">
        <div onClick={handleLogout} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 text-red-600 font-medium">
          <span>로그아웃</span><span>&gt;</span>
        </div>
        <div onClick={handleDeleteAccount} className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 text-red-600 font-medium">
          <span>회원탈퇴</span><span>&gt;</span>
        </div>
      </div>
    </div>
  );
}
