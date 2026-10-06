import React, { useState, useRef, useEffect } from 'react';
import Icon from '../components/Icon';

function timeLabel(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
}

function dateLabel(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function sameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

/**
 * 단체 채팅방 페이지
 * - 내 메시지는 오른쪽 파란 말풍선, 상대 메시지는 왼쪽 흰 말풍선
 * - 시스템 메시지(입장/퇴장)는 가운데 캡슐
 * - 날짜가 바뀌면 날짜 구분선 표시
 */
export default function ChatRoomPage({
  activeRoom,
  messages,
  currentUserId,
  sendMessage,
  isConnected,
  onBack,
  openStudyDetail,
}) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  // 새 메시지 도착 시 하단으로 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    if (sendMessage(input)) setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* 헤더 */}
      <header className="flex items-center gap-2 px-3 py-3 bg-white/95 backdrop-blur border-b border-gray-100 sticky top-0 z-10">
        <button type="button" aria-label="채팅 목록으로 돌아가기" onClick={onBack} className="p-1.5 -ml-1 text-gray-700 rounded-full hover:bg-gray-100 transition">
          <Icon name="back" size={22} />
        </button>
        <button
          type="button"
          className="flex-1 min-w-0 cursor-pointer text-left"
          onClick={() => openStudyDetail && openStudyDetail(activeRoom.studyId)}
        >
          <div className="flex items-center gap-1.5">
            <h1 className="text-[15px] font-bold text-gray-900 truncate">{activeRoom.studyTitle}</h1>
            <span className="text-xs text-gray-400 shrink-0">{activeRoom.memberCount}</span>
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            {isConnected ? '실시간 연결됨' : '연결 중...'}
          </p>
        </button>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-10">
            아직 메시지가 없어요. 첫 인사를 건네보세요!
          </p>
        )}
        {messages.map((msg, idx) => {
          const prev = messages[idx - 1];
          const showDate = !prev || !sameDay(prev.createdAt, msg.createdAt);
          const isMine = msg.senderId === currentUserId;
          const isSystem = msg.type === 'SYSTEM';
          // 같은 사람이 연속으로 보내면 이름은 첫 메시지에만
          const showName =
            !isMine && !isSystem &&
            (!prev || prev.senderId !== msg.senderId || prev.type === 'SYSTEM' || showDate);

          return (
            <React.Fragment key={msg.id ?? idx}>
              {showDate && (
                <div className="flex justify-center py-2.5">
                  <span className="text-[10px] text-gray-400 bg-white/80 px-3 py-1 rounded-full border border-gray-100">
                    {dateLabel(msg.createdAt)}
                  </span>
                </div>
              )}

              {isSystem ? (
                <div className="flex justify-center py-1">
                  <span className="text-[11px] text-gray-500 bg-gray-200/70 px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              ) : (
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${showName ? 'mt-2.5' : 'mt-0.5'}`}>
                  <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    {showName && (
                      <span className="text-[11px] text-gray-500 font-medium mb-1 ml-1">{msg.senderName}</span>
                    )}
                    <div className={`flex items-end gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <div
                        className={`px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          isMine
                            ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                            : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 mb-0.5">{timeLabel(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-3 py-2.5 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지 보내기"
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-24"
          />
          <button
            type="button"
            aria-label="메시지 보내기"
            onClick={handleSend}
            disabled={!input.trim() || !isConnected}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
              input.trim() && isConnected
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
