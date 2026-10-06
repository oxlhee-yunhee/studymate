import React from 'react';
import StudyCard from '../components/StudyCard';
import Icon from '../components/Icon';

const CATEGORY_ICONS = {
  전공: '📚',
  어학: '🗣️',
  자격증: '📝',
  취업: '💼',
};

export default function MainPage({
  studies,
  selectedCategory,
  selectCategory,
  categoryStats,
  searchKeyword,
  setSearchKeyword,
  handleSearchSubmit,
  viewStudyDetail,
  handleToggleWish,
  currentUserId,
  setCurrentPage,
  openNotifications,
}) {
  return (
    <div className="flex-1 pb-20">
      <div className="p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-3">
          <button
            type="button"
            className="text-xl font-extrabold tracking-tight text-blue-600 cursor-pointer"
            onClick={() => setCurrentPage('main')}
          >
            Study<span className="text-gray-900">Mate</span>
          </button>
          <button type="button" aria-label="알림 보기" onClick={openNotifications} className="icon-button -mr-1 text-gray-600">
            <Icon name="bell" size={21} />
          </button>
        </div>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="스터디 과목, 키워드로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon name="search" size={16} />
          </span>
        </form>
      </div>

      <div className="flex p-4 space-x-2 overflow-x-auto bg-white scrollbar-none">
        {['전체', '전공', '어학', '자격증', '취업', '기타'].map((cat) => (
          <button
            key={cat}
            onClick={() => selectCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="p-4">
        <h2 className="text-sm font-bold text-gray-900 mb-3">인기 카테고리</h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          {Object.entries(categoryStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([category, count]) => (
              <button
                type="button"
                key={category}
                onClick={() => selectCategory(category)}
                className="bg-white p-3 border border-gray-100 rounded-xl shadow-sm cursor-pointer hover:border-blue-300 transition text-center"
              >
                <div className="text-lg mb-1">{CATEGORY_ICONS[category] || '💻'}</div>
                <div className="text-xs font-medium">{category}</div>
                <div className="text-xs text-blue-500 font-bold mt-0.5">{count}개</div>
              </button>
            ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-gray-900">추천 스터디</h2>
          <button onClick={() => setCurrentPage('search')} className="text-xs text-blue-500 font-semibold">더보기 &gt;</button>
        </div>
        <div className="space-y-3">
          {studies.length === 0 ? (
            <div className="empty-state">
              <span className="text-2xl" aria-hidden="true">📚</span>
              <p className="mt-2 font-semibold text-gray-600">아직 등록된 스터디가 없어요</p>
              <p className="mt-1 text-xs">첫 스터디를 만들어 함께 시작해보세요.</p>
            </div>
          ) : studies.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              currentUserId={currentUserId}
              onClick={viewStudyDetail}
              onToggleWish={handleToggleWish}
              variant="main"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
