import React from 'react';

export default function LoginPage({ loginEmail, setLoginEmail, loginPassword, setLoginPassword, handleLogin, setCurrentPage }) {
  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">스터디메이트</h1>
        <p className="text-gray-500 mt-2 text-sm">함께 공부할 팀원을 찾아보세요</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="아이디 또는 이메일"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition">
          로그인
        </button>
      </form>
      <button onClick={() => setCurrentPage('register')} className="w-full border border-gray-300 text-gray-600 font-bold py-3 rounded-lg mt-3 hover:bg-gray-50 transition">
        회원가입
      </button>
      <div className="flex justify-between text-xs text-gray-400 mt-4 px-2">
        <span className="cursor-pointer">아이디 찾기</span>
        <span>|</span>
        <span className="cursor-pointer">비밀번호 찾기</span>
      </div>
    </div>
  );
}
