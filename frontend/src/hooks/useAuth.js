import { useState, useEffect, useRef } from 'react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
  deleteUser,
} from '../firebase';
import * as studyApi from '../api/studyApi';

/**
 * 인증 관련 상태와 로직을 관리하는 훅
 *
 * @param {function} setCurrentPage - 페이지 이동 setter (App.js가 소유하는 라우팅 상태)
 * @param {function} onAutoLoginSuccess - 자동 로그인(onAuthStateChanged) 성공 시 호출.
 *   studies/profile/categoryStats 등 초기 데이터 로드를 위해 App.js에서 전달.
 *   수동 로그인(handleLogin)에서는 원본 동작과 동일하게 호출하지 않음.
 */
export default function useAuth(setCurrentPage, onAutoLoginSuccess) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    grade: 1,
  });
  const autoLogoutTimer = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await studyApi.ssoLogin(idToken, firebaseUser.email);
          setCurrentUserId(res.data.id);
          setCurrentPage('main');
          onAutoLoginSuccess?.(res.data.id);
        } catch (err) {
          console.log('자동 로그인 실패:', err);
        }
      } else {
        setCurrentPage('login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    events.forEach((event) => window.addEventListener(event, resetAutoLogoutTimer));
    resetAutoLogoutTimer();
    return () => {
      events.forEach((event) => window.removeEventListener(event, resetAutoLogoutTimer));
      if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const resetAutoLogoutTimer = () => {
    if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    autoLogoutTimer.current = setTimeout(async () => {
      await signOut(auth);
      setCurrentUserId(null);
      setCurrentPage('login');
      alert('장시간 활동이 없어 자동 로그아웃 되었습니다.');
    }, 2 * 60 * 60 * 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.endsWith('@sch.ac.kr')) {
      alert('SCH 이메일(@sch.ac.kr)만 로그인 가능합니다.');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      if (!userCredential.user.emailVerified) {
        alert('이메일 인증이 필요합니다.\n받은 편지함을 확인해주세요.');
        return;
      }
      const idToken = await userCredential.user.getIdToken();
      const res = await studyApi.ssoLogin(idToken, loginEmail);
      setCurrentUserId(res.data.id);
      onAutoLoginSuccess?.(res.data.id);
      setCurrentPage('main');
    } catch (err) {
      console.log(err);
      const code = err?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        alert('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (code === 'auth/too-many-requests') {
        alert('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else if (err?.message === 'Network Error' || code === 'ERR_NETWORK') {
        alert('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
      } else {
        alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerForm.email.endsWith('@sch.ac.kr')) {
      alert('SCH 이메일(@sch.ac.kr)만 가입 가능합니다.');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerForm.email, registerForm.password);
      await sendEmailVerification(userCredential.user);
      const idToken = await userCredential.user.getIdToken();
      await studyApi.ssoLogin(idToken, registerForm.email, {
        name: registerForm.name,
        department: registerForm.department,
        grade: parseInt(registerForm.grade),
      });
      alert('가입 완료! 이메일로 인증 링크를 보냈습니다.\n인증 후 로그인해주세요.');
      setCurrentPage('login');
    } catch (err) {
      console.log('에러:', err);
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        alert('이미 가입된 이메일입니다. 로그인해주세요.');
      } else if (code === 'auth/weak-password') {
        alert('비밀번호는 6자 이상으로 입력해주세요.');
      } else if (code === 'auth/invalid-email') {
        alert('올바른 이메일 주소를 입력해주세요.');
      } else if (err?.message === 'Network Error' || code === 'ERR_NETWORK') {
        alert('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
      } else {
        alert('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUserId(null);
    setCurrentPage('login');
    alert('로그아웃 되었습니다.');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    try {
      await studyApi.deleteAccount(currentUserId);
      await deleteUser(auth.currentUser);
      setCurrentUserId(null);
      setCurrentPage('login');
      alert('탈퇴가 완료되었습니다.');
    } catch (err) {
      console.log(err);
      alert('탈퇴에 실패했습니다. 다시 로그인 후 시도해주세요.');
    }
  };

  return {
    currentUserId,
    isLoading,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    registerForm,
    setRegisterForm,
    handleLogin,
    handleRegister,
    handleLogout,
    handleDeleteAccount,
  };
}
