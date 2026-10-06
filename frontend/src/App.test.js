import { render, screen } from '@testing-library/react';
import LoginPage from './pages/LoginPage';

test('로그인 화면에 필수 입력과 주요 동작이 표시된다', () => {
  render(
    <LoginPage
      loginEmail=""
      setLoginEmail={() => {}}
      loginPassword=""
      setLoginPassword={() => {}}
      handleLogin={() => {}}
      setCurrentPage={() => {}}
    />
  );

  expect(screen.getByRole('heading', { name: '스터디메이트' })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('아이디 또는 이메일')).toBeRequired();
  expect(screen.getByPlaceholderText('비밀번호')).toBeRequired();
  expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument();
});
