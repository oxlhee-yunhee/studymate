import React from 'react';
import Icon from '../components/Icon';

/** '오전 10:24' / '어제' / '7월 21일' 형식으로 표기 */
function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
  }
  if (date >= startOfYesterday) return '어제';
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * 채팅 목록 페이지: 내가 참여 중인 스터디의 단체 채팅방 목록
 */
export default function ChatListPage({ chatRooms, openChatRoom, goExplore }) {
  return (
    <div className="flex-1 pb-20 bg-white min-h-screen">
      <header className="p-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
        <h1 className="text-lg font-bold text-gray-900">채팅</h1>
        <p className="text-xs text-gray-400 mt-0.5">참여 중인 스터디의 단체 채팅방</p>
      </header>

      {chatRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 pt-28 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
            <Icon name="chat" size={30} />
          </div>
          <p className="text-sm font-bold text-gray-800">아직 채팅방이 없어요</p>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            스터디를 만들거나 참여 승인을 받으면<br />단체 채팅방이 자동으로 열려요.
          </p>
          <button
            onClick={goExplore}
            className="mt-5 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition"
          >
            스터디 둘러보기
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {chatRooms.map((room) => (
            <li
              key={room.studyId}
            >
              <button
                type="button"
                onClick={() => openChatRoom(room)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition"
              >
              {room.representativeImage ? (
                <img
                  src={room.representativeImage}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Icon name="users" size={22} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900 truncate">{room.studyTitle}</span>
                  <span className="text-[11px] text-gray-400 shrink-0">{room.memberCount}</span>
                </div>
                <p className={`text-xs mt-0.5 truncate ${
                  room.lastMessageType === 'SYSTEM' ? 'text-gray-400 italic' : 'text-gray-500'
                }`}>
                  {room.lastMessage || '대화를 시작해 보세요'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[10px] text-gray-400">{formatTime(room.lastMessageAt)}</span>
                {room.unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {room.unreadCount > 99 ? '99+' : room.unreadCount}
                  </span>
                )}
              </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
