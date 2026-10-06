import React from 'react';

export default function InquiryPage({
  inquiryForm,
  setInquiryForm,
  handleSubmitInquiry,
  onBack,
}) {
  const onSubmit = async (e) => {
    const success = await handleSubmitInquiry(e);
    if (success) onBack();
  };

  return (
    <div className="flex-1 pb-20">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-2 sticky top-0 z-10">
        <button onClick={onBack} className="text-lg">←</button>
        <h1 className="text-md font-bold">문의하기</h1>
      </div>
      <form onSubmit={onSubmit} className="p-4 space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">제목</label>
          <input
            type="text"
            required
            value={inquiryForm.title}
            onChange={(e) => setInquiryForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="문의 제목을 입력하세요"
            className="w-full bg-gray-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">내용</label>
          <textarea
            required
            rows={8}
            value={inquiryForm.content}
            onChange={(e) => setInquiryForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="문의하실 내용을 자세히 작성해주세요"
            className="w-full bg-gray-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700"
        >
          문의 접수하기
        </button>
      </form>
    </div>
  );
}
