import React from 'react';
import Icon from './Icon';

/**
 * 스터디 카드 컴포넌트
 * @param {object} study - 스터디 데이터
 * @param {string} currentUserId - 현재 로그인한 사용자 ID
 * @param {function} onClick - 카드 클릭 시 (상세 페이지 이동)
 * @param {function} onToggleWish - 찜 버튼 클릭 시 (없으면 찜 버튼 미표시)
 * @param {string} variant - 'main' | 'search' (스타일 차이)
 */
export default function StudyCard({ study, currentUserId, onClick, onToggleWish, variant = 'main' }) {
  const isMain = variant === 'main';

  return (
    <article
      onClick={() => onClick(study.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(study.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${study.title} 상세 보기`}
      className={`bg-white p-4 border border-gray-200 rounded-xl flex space-x-3 cursor-pointer transition ${
        isMain ? 'shadow-sm hover:border-blue-300' : ''
      }`}
    >
      <img src={study.representativeImage} alt="" className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
      <div className="flex-1 min-w-0">
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
            isMain ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {study.category}
        </span>
        <h3 className="text-sm font-bold text-gray-900 mt-1 truncate">{study.title}</h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{study.introduction}</p>
        {!isMain && <div className="text-[11px] text-gray-400 mt-2">📆 {study.schedule}</div>}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-gray-400">🕒 {study.timeInfo}</span>
          <span className="text-xs font-bold text-blue-600">
            {study.currentParticipants}/{study.maxParticipants}명
          </span>
        </div>
      </div>
      {onToggleWish && (
        <button
          type="button"
          aria-label={study.wishlistedUserIds?.includes(currentUserId) ? '찜 해제' : '찜하기'}
          onClick={(e) => onToggleWish(study.id, e)}
          className={`icon-button self-start -mt-2 -mr-2 transition ${
            study.wishlistedUserIds?.includes(currentUserId) ? 'text-red-500' : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <Icon name="heart" size={20} filled={study.wishlistedUserIds?.includes(currentUserId)} />
        </button>
      )}
    </article>
  );
}
