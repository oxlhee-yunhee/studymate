import React from 'react';
import Icon from './Icon';

const TABS = [
  { key: 'main', icon: 'home', label: '홈' },
  { key: 'search', icon: 'search', label: '검색' },
  { key: 'create', icon: 'plus', label: '만들기' },
  { key: 'chatList', icon: 'chat', label: '채팅' },
  { key: 'mypage', icon: 'user', label: '마이' },
];

// 채팅 관련 화면에 있을 때도 '채팅' 탭이 활성 상태로 보이도록 매핑
const ACTIVE_ALIAS = { chatRoom: 'chatList' };

/**
 * 하단 네비게이션 바 (홈 / 검색 / 만들기 / 채팅 / 마이)
 * @param {string} currentPage - 현재 페이지
 * @param {function} navigateTo - 페이지 이동 헬퍼 (App.js에서 전달)
 * @param {number} chatUnreadCount - 안 읽은 채팅 메시지 수 (배지)
 */
export default function NavBar({ currentPage, navigateTo, chatUnreadCount = 0 }) {
  const activeKey = ACTIVE_ALIAS[currentPage] || currentPage;

  return (
    <nav aria-label="주요 메뉴" className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur border-t border-gray-200 grid grid-cols-5 items-center z-20 max-w-md mx-auto pb-safe">
      {TABS.map(({ key, icon, label }) => {
        const isActive = activeKey === key;
        return (
          <button
            type="button"
            key={key}
            onClick={() => navigateTo(key)}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="relative">
              <Icon name={icon} size={22} filled={isActive && icon === 'heart'} />
              {key === 'chatList' && chatUnreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                </span>
              )}
            </span>
            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
