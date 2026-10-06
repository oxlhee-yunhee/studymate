import React, { useState } from 'react';

function InquiryItem({ inquiry, onAnswer }) {
  const [answer, setAnswer] = useState(inquiry.answer || '');
  const answered = inquiry.status === '답변완료';

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-xl space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-bold text-gray-900">{inquiry.title}</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${answered ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
          {inquiry.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 whitespace-pre-wrap">{inquiry.content}</p>
      <p className="text-[11px] text-gray-400">
        문의자 ID: {inquiry.userId} · {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleString('ko-KR') : ''}
      </p>

      {answered ? (
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700">
          <span className="font-bold text-gray-500">답변: </span>{inquiry.answer}
        </div>
      ) : (
        <div className="flex space-x-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="답변을 입력하세요"
            className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => answer.trim() && onAnswer(inquiry.id, answer)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700"
          >
            답변 등록
          </button>
        </div>
      )}
    </div>
  );
}

export default function InquiryAdminPage({ adminInquiries, handleAnswerInquiry, onBack }) {
  return (
    <div className="flex-1 pb-20">
      <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-2 sticky top-0 z-10">
        <button onClick={onBack} className="text-lg">←</button>
        <h1 className="text-md font-bold">문의 관리</h1>
      </div>
      <div className="p-4 space-y-3">
        {adminInquiries.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">접수된 문의가 없습니다.</div>
        ) : (
          adminInquiries.map((inquiry) => (
            <InquiryItem key={inquiry.id} inquiry={inquiry} onAnswer={handleAnswerInquiry} />
          ))
        )}
      </div>
    </div>
  );
}
