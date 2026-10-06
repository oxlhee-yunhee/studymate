import React from 'react';
import Icon from '../components/Icon';

export default function StudyDetailPage({
  selectedStudyDetail,
  openChatFromDetail,
  currentUserId,
  userNames,
  handleToggleWish,
  handleDeleteStudy,
  handleApproveUser,
  handleRejectUser,
  handleKickMember,
  handleApplyStudy,
  setCurrentPage,
}) {
  const isParticipant = selectedStudyDetail.participantIds?.includes(currentUserId);
  const isPending = selectedStudyDetail.pendingUserIds?.includes(currentUserId);
  const isCreator = selectedStudyDetail.creatorId === currentUserId;

  return (
    <div className="flex-1 overflow-y-auto bg-white" style={{ paddingBottom: '140px' }}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
        <div className="flex items-center space-x-2">
          <button onClick={() => setCurrentPage('main')} className="p-1 -ml-1 text-gray-700 rounded-full hover:bg-gray-100 transition">
            <Icon name="back" size={22} />
          </button>
          <h1 className="text-md font-bold">스터디 상세</h1>
        </div>
        <div className="flex space-x-3 text-lg">
          <button
            onClick={() => handleToggleWish(selectedStudyDetail.id)}
            className={selectedStudyDetail.wishlistedUserIds?.includes(currentUserId) ? 'text-red-500' : 'text-gray-400'}
          >
            <Icon name="heart" size={22} filled={selectedStudyDetail.wishlistedUserIds?.includes(currentUserId)} />
          </button>
          <button onClick={() => alert('링크가 복사되었습니다.')}>🔗</button>
          {isCreator && (
            <button onClick={() => handleDeleteStudy(selectedStudyDetail.id)} className="text-sm text-red-500">🗑️</button>
          )}
        </div>
      </div>
      <img src={selectedStudyDetail.representativeImage} alt="Cover" className="w-full h-48 object-cover bg-gray-100" />
      <div className="p-4">
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold">{selectedStudyDetail.category}</span>
        <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedStudyDetail.title}</h2>
        <div className="mt-4 bg-gray-50 p-4 rounded-xl space-y-2.5 text-sm border border-gray-100">
          <div className="flex gap-5">
            <span className="min-w-[80px] shrink-0 font-medium text-gray-400">📆 일정</span>
            <span className="text-gray-800">{selectedStudyDetail.schedule}</span>
          </div>
          <div className="flex gap-5">
            <span className="min-w-[80px] shrink-0 font-medium text-gray-400">🕒 시간</span>
            <span className="text-gray-800">{selectedStudyDetail.timeInfo}</span>
          </div>
          <div className="flex gap-5">
            <span className="min-w-[80px] shrink-0 font-medium text-gray-400">📍 장소</span>
            <span className="text-gray-800">{selectedStudyDetail.location}</span>
          </div>
          <div className="flex gap-5">
            <span className="min-w-[80px] shrink-0 font-medium text-gray-400">👥 모집인원</span>
            <span className="font-bold text-blue-600">
              {selectedStudyDetail.currentParticipants} / {selectedStudyDetail.maxParticipants}명
            </span>
          </div>
          <div className="flex gap-5">
            <span className="min-w-[80px] shrink-0 font-medium text-gray-400">🔍 모집상태</span>
            <span className="text-green-600 font-semibold">{selectedStudyDetail.status}</span>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">스터디 소개</h3>
          <p className="text-sm text-gray-600 leading-relaxed bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
            {selectedStudyDetail.introduction}
          </p>
        </div>
        {selectedStudyDetail.joinCondition && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">참여 조건</h3>
            <p className="text-sm text-gray-600 leading-relaxed bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
              {selectedStudyDetail.joinCondition}
            </p>
          </div>
        )}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">진행 방식</h3>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="border border-gray-200 p-3 rounded-lg">
              <div className="font-semibold text-gray-400 mb-1">진행 형태</div>
              <div className="text-gray-800 font-medium">{selectedStudyDetail.progressMethod}</div>
            </div>
            <div className="border border-gray-200 p-3 rounded-lg">
              <div className="font-semibold text-gray-400 mb-1">과제 여부</div>
              <div className="text-gray-800 font-medium">매주 제공</div>
            </div>
          </div>
        </div>
        {isParticipant && (
          <button
            onClick={openChatFromDetail}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 font-bold text-sm py-3 rounded-xl border border-blue-100 hover:bg-blue-100 transition"
          >
            <Icon name="chat" size={18} />
            단체 채팅방 입장하기
          </button>
        )}
        {isParticipant && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">팀원 목록 ({selectedStudyDetail.currentParticipants}명)</h3>
            <div className="space-y-2">
              {selectedStudyDetail.participantIds?.map((memberId) => (
                <div key={memberId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-800">{userNames[memberId] || memberId}</span>
                    {memberId === selectedStudyDetail.creatorId && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">방장</span>
                    )}
                  </div>
                  {isCreator && memberId !== currentUserId && (
                    <button
                      onClick={() => handleKickMember(selectedStudyDetail.id, memberId)}
                      className="text-xs text-red-500 border border-red-300 px-2 py-1 rounded hover:bg-red-50"
                    >
                      내보내기
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {isCreator && selectedStudyDetail.pendingUserIds?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">신청 대기 ({selectedStudyDetail.pendingUserIds.length}명)</h3>
            <div className="space-y-2">
              {selectedStudyDetail.pendingUserIds.map((userId) => (
                <div key={userId} className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <span className="text-sm text-gray-800">{userNames[userId] || userId}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveUser(selectedStudyDetail.id, userId)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleRejectUser(selectedStudyDetail.id, userId)}
                      className="text-xs border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-50"
                    >
                      거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">태그 리스트</h3>
          <div className="flex flex-wrap gap-1.5">
            {selectedStudyDetail.tagList?.map((t) => (
              <span key={t} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">#{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-md mx-auto">
        <button
          onClick={() =>
            isParticipant || isCreator
              ? openChatFromDetail()
              : handleApplyStudy(selectedStudyDetail.id)
          }
          disabled={isPending || (!isParticipant && !isCreator && selectedStudyDetail.status === '마감')}
          className={`w-full font-bold py-3 rounded-lg shadow text-center transition 
            ${isParticipant || isCreator ? 'bg-blue-600 text-white hover:bg-blue-700'
              : isPending ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
              : selectedStudyDetail.status === '마감' ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isParticipant || isCreator ? '단체 채팅방 이동'
            : isPending ? '승인 대기 중'
            : selectedStudyDetail.status === '마감' ? '모집 마감'
            : '스터디 신청하기'}
        </button>
      </div>
    </div>
  );
}
