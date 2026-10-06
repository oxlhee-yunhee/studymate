import React from 'react';

/**
 * 프로필 수정 모달
 * @param {object} form - editProfileForm 상태
 * @param {function} setForm - editProfileForm setter
 * @param {function} onCancel - 취소 버튼
 * @param {function} onSave - 저장 버튼
 */
export default function EditProfileModal({ form, setForm, onCancel, onSave }) {
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, profileImage: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900">프로필 수정</h2>
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border flex-shrink-0">
            {form.profileImage ? (
              <img src={form.profileImage} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">👤</div>
            )}
          </div>
          <label className="cursor-pointer bg-white border border-gray-300 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50">
            이미지 변경
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">학과</label>
          <input
            type="text"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">학년</label>
          <select
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
          >
            <option value={1}>1학년</option>
            <option value={2}>2학년</option>
            <option value={3}>3학년</option>
            <option value={4}>4학년</option>
          </select>
        </div>
        <div className="flex space-x-2 pt-2">
          <button onClick={onCancel} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">
            취소
          </button>
          <button onClick={onSave} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
