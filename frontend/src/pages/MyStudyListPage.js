import React from 'react';
import StudyCard from '../components/StudyCard';

export default function MyStudyListPage({
  title,
  studies,
  viewStudyDetail,
  handleToggleWish,
  currentUserId,
  setCurrentPage,
}) {
  return (
    <div className="flex-1 pb-20">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-2 sticky top-0 z-10">
        <button onClick={() => setCurrentPage('mypage')} className="text-lg">←</button>
        <h1 className="text-md font-bold">{title}</h1>
      </div>
      <div className="p-4 space-y-3">
        {studies.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">표시할 스터디가 없습니다.</div>
        ) : (
          studies.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              currentUserId={currentUserId}
              onClick={viewStudyDetail}
              onToggleWish={handleToggleWish}
              variant="search"
            />
          ))
        )}
      </div>
    </div>
  );
}
