import React from 'react';

export default function RegisterPage({ registerForm, setRegisterForm, handleRegister, setCurrentPage }) {
  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 bg-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-600 tracking-tight">회원가입</h1>
        <p className="text-gray-500 mt-2 text-sm">SCH 이메일로 가입해주세요</p>
      </div>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="이름"
          value={registerForm.name}
          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="이메일 (@sch.ac.kr)"
          value={registerForm.email}
          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="비밀번호 (6자 이상)"
          value={registerForm.password}
          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="학과"
          value={registerForm.department}
          onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          value={registerForm.grade}
          onChange={(e) => setRegisterForm({ ...registerForm, grade: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>1학년</option>
          <option value={2}>2학년</option>
          <option value={3}>3학년</option>
          <option value={4}>4학년</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition">
          가입하기
        </button>
      </form>
      <button onClick={() => setCurrentPage('login')} className="w-full text-gray-500 text-sm mt-4">
        이미 계정이 있으신가요? 로그인
      </button>
    </div>
  );
}
