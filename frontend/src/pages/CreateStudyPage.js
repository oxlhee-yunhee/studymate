import React from 'react';

const PRESET_TAGS = ['#공부습관', '#모의고사', '#토익', '#코딩', '#취업준비'];
const CATEGORIES = ['전공', '어학', '자격증', 'IT/프로그래밍', '취업', '기타'];
const PROGRESS_METHODS = ['온라인', '오프라인', '온오프라인 병행'];

export default function CreateStudyPage({ createForm, setCreateForm, handleCreateStudy, setCurrentPage }) {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setCreateForm({ ...createForm, representativeImage: reader.result });
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag) => {
    const tagName = tag.replace('#', '');
    if (createForm.tags.includes(tagName)) {
      setCreateForm({ ...createForm, tags: createForm.tags.filter((t) => t !== tagName) });
    } else if (createForm.tags.length < 5) {
      setCreateForm({ ...createForm, tags: [...createForm.tags, tagName] });
    }
  };

  const addCustomTag = () => {
    if (createForm.tags.length >= 5) {
      alert('태그는 최대 5개까지 추가할 수 있습니다.');
      return;
    }
    const newTag = prompt('태그를 입력해주세요 (#제외)');
    if (newTag && newTag.trim()) setCreateForm({ ...createForm, tags: [...createForm.tags, newTag.trim()] });
  };

  return (
    <div className="flex-1 pb-20 bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center space-x-2 sticky top-0 bg-white z-10">
        <button onClick={() => setCurrentPage('main')} className="text-lg">←</button>
        <h1 className="text-md font-bold">스터디 만들기</h1>
      </div>
      <form onSubmit={handleCreateStudy} className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">스터디 제목</label>
          <input
            type="text"
            required
            placeholder="스터디 제목을 입력해주세요"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">카테고리 선택</label>
          <select
            value={createForm.category}
            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            대표 이미지 <span className="text-gray-400 font-normal">(선택)</span>
          </label>
          <div className="flex items-center space-x-3">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
              {createForm.representativeImage ? (
                <img src={createForm.representativeImage} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-gray-300">+</span>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-xs text-gray-400 leading-relaxed">스터디를 대표할 이미지를<br />업로드해주세요</p>
              <label className="cursor-pointer bg-white border border-gray-300 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-center">
                이미지 업로드
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {createForm.representativeImage && (
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, representativeImage: '' })}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  이미지 삭제
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">스터디 소개</label>
          <textarea
            required
            rows="3"
            placeholder="스터디를 소개해주세요 (목표, 운영 방식 등)"
            value={createForm.introduction}
            onChange={(e) => setCreateForm({ ...createForm, introduction: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
            maxLength="500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">참여 조건</label>
          <textarea
            rows="2"
            placeholder="참여 조건을 입력해주세요 (예: 주 2회 출석 필수, 과제 제출 필수 등)"
            value={createForm.joinCondition}
            onChange={(e) => setCreateForm({ ...createForm, joinCondition: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
            maxLength="300"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">진행 방식</label>
          <div className="grid grid-cols-3 gap-2">
            {PROGRESS_METHODS.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setCreateForm({ ...createForm, progressMethod: m })}
                className={`py-2 text-xs font-medium rounded-lg border ${
                  createForm.progressMethod === m ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-gray-700">일정</label>
            <label className="flex items-center space-x-1 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={createForm.isAlwaysOpen}
                onChange={(e) => setCreateForm({ ...createForm, isAlwaysOpen: e.target.checked })}
              />
              <span>상시 모집</span>
            </label>
          </div>
          {!createForm.isAlwaysOpen && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">시작일</label>
                <input
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">종료일</label>
                <input
                  type="date"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-gray-700">시간</label>
            <label className="flex items-center space-x-1 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={createForm.isTimeUnknown}
                onChange={(e) => setCreateForm({ ...createForm, isTimeUnknown: e.target.checked })}
              />
              <span>시간 미정</span>
            </label>
          </div>
          {!createForm.isTimeUnknown && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">시작 시간</label>
                <input
                  type="time"
                  value={createForm.startTime}
                  onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">종료 시간</label>
                <input
                  type="time"
                  value={createForm.endTime}
                  onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">장소</label>
          <input
            type="text"
            required
            placeholder="예: Google Meet 혹은 도서관룸"
            value={createForm.location}
            onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">모집 인원 ({createForm.maxParticipants}명)</label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setCreateForm({ ...createForm, maxParticipants: Math.max(2, createForm.maxParticipants - 1) })}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              -
            </button>
            <span className="font-bold text-sm">{createForm.maxParticipants}명</span>
            <button
              type="button"
              onClick={() => setCreateForm({ ...createForm, maxParticipants: createForm.maxParticipants + 1 })}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">태그 <span className="text-gray-400 font-normal">(최대 5개)</span></label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-xs border transition ${
                  createForm.tags.includes(tag.replace('#', '')) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
            <button
              type="button"
              onClick={addCustomTag}
              className="px-3 py-1 rounded-full text-xs border border-dashed border-gray-400 text-gray-500"
            >
              + 태그 추가
            </button>
          </div>
          {createForm.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {createForm.tags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => setCreateForm({ ...createForm, tags: createForm.tags.filter((t) => t !== tag) })}
                  className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full cursor-pointer"
                >
                  #{tag} ✕
                </span>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition mt-4">
          등록하기
        </button>
      </form>
    </div>
  );
}
