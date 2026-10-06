import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  browserSessionPersistence,
  setPersistence,
  signOut,
  deleteUser,
} from 'firebase/auth';

// 값은 .env.development / .env.production 에서 주입된다.
// (Firebase 웹 설정은 공개되는 식별자라 비밀이 아니지만,
//  프로젝트를 바꿔 배포할 수 있도록 코드에서 분리해 둔다)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId')
  .map(([key]) => key);

if (missing.length > 0) {
  // 빌드 시 .env 파일이 빠지면 로그인 화면이 조용히 죽는다. 원인을 바로 알 수 있게 남긴다.
  console.error(
    'Firebase 설정값이 비어 있습니다: ' + missing.join(', ') +
      ' — frontend/.env.development(또는 .env.production)을 확인하세요.'
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence); //브라우저 닫으면 로그아웃
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  signOut,
  deleteUser,
};
