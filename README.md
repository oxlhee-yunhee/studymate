# StudyMate (스터디메이트)

순천향대학교(SCH) 학생들을 위한 스터디 모집 웹 애플리케이션입니다.

## 기술 스택

| 영역 | 스택 |
|---|---|
| 백엔드 | Spring Boot, Java 17, PostgreSQL, Spring Security, Spring WebSocket(STOMP), Firebase Admin SDK, Spring Mail |
| 프론트엔드 | React, Tailwind CSS, Axios, Firebase SDK, @stomp/stompjs, sockjs-client |
| 인증 | Firebase Authentication (`@sch.ac.kr` 이메일 전용) |

---

## 주요 기능

### 인증
- `@sch.ac.kr` 이메일만 회원가입/로그인 가능, 가입 시 이메일 인증 필수
- 새로고침 시 로그인 상태 유지, 무활동 시 자동 로그아웃

### 스터디
- 생성: 제목, 카테고리, 대표이미지, 소개, 참여조건, 진행방식, 일정/시간, 장소, 모집인원, 태그
- 검색/카테고리 필터(전체·전공·어학·자격증·취업·기타), 찜하기
- 참여 신청 → 방장 승인/거절, 강제 내보내기
- 인기 카테고리: 실제 등록 수 기준 표시

### 채팅 (WebSocket)
- 스터디 생성 시 단체 채팅방 자동 개설, 참여 승인 시 자동 입장(시스템 메시지)
- STOMP over SockJS 실시간 메시지 (`/ws-chat` 접속 → `/app/chat/{studyId}` 발행 → `/topic/chat/{studyId}` 구독)
- 하단 네비게이션 '채팅' 탭: 참여 중인 채팅방 목록, 마지막 메시지·안읽음 배지 표시
- 방별/전체 안읽음 수 관리(읽음 시각 기준), 강제 내보내기·스터디 삭제 시 채팅 데이터 정리
- 스터디 상세 페이지에서 참여자는 채팅방 바로 입장 가능

### 마이페이지
- 프로필 수정(이름, 학과, 학년, 사진)
- 내가 만든 스터디 / 참여 중인 스터디 / 찜 목록 전용 조회 페이지
- 설정 페이지: 로그아웃 / 회원탈퇴

### 알림
- 참여 신청 시 방장에게, 승인 시 신청자에게 자동 알림
- 문의 접수/답변 완료 시 자동 알림
- 알림 읽음 처리, 전체 읽음 처리

### 문의하기
- 제목/내용 작성 시 관리자 이메일(Gmail SMTP)로 자동 발송
- 관리자 전용 문의 관리 페이지에서 답변 작성 → 문의자에게 답변 완료 알림

### UI/UX
- 하단 고정 네비게이션 바(홈/검색/만들기/채팅/마이) + SVG 아이콘, 브라우저 뒤로가기(popstate) 대응
- Pretendard 폰트 적용, 채팅 말풍선 UI(날짜 구분선, 연속 메시지 이름 생략, 자동 스크롤)

---

## 프로젝트 구조

```
studymate/               ← Spring Boot 백엔드
  src/main/java/com/studymate/studymate/
    config/              # Security, Firebase 설정
    controller/          # Auth, User, Study, Notification, Inquiry, Chat, ChatSocket
    entity/              # User, Study, Notification, Inquiry, ChatMessage, ChatReadStatus
    repository/
    service/             # MailService, ChatService (시스템 메시지·브로드캐스트)
    dto/

frontend/                ← React 프론트엔드
  src/
    api/studyApi.js      # 모든 axios 호출 모음
    hooks/               # useAuth, useStudy, useNotification, useChat(STOMP 연결)
    pages/               # 화면별 컴포넌트
    components/          # NavBar, StudyCard, EditProfileModal
    App.js               # 라우팅(currentPage) + 훅 조합
```

---

## 실행 방법

### 사전 준비
1. Firebase 서비스 계정 키를 `config/firebase/serviceAccount.json`에 저장 (Git 제외)
2. `frontend/src/firebase.js`의 `firebaseConfig`를 본인 Firebase 프로젝트 값으로 설정
3. (선택) 문의하기 이메일 발송을 쓰려면 `studymate/src/main/resources/application-local.properties`에 아래 값 설정 (Git 제외)
   ```properties
   spring.mail.username=발신용Gmail주소
   spring.mail.password=Gmail앱비밀번호
   ```

### 데이터베이스 (PostgreSQL)
```bash
# 프로젝트 루트에서 (Docker 필요)
docker compose up -d
# localhost:5432 / db=studymate / user=studymate / pw=studymate
```
- Docker 없이 직접 설치한 PostgreSQL을 쓰는 경우, `studymate` DB와 사용자만 만들면 됩니다. 스키마는 기동 시 자동 생성(ddl-auto=update)됩니다.
- 접속 정보는 환경변수 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`로 덮어쓸 수 있습니다.

### 백엔드
```bash
cd studymate
./gradlew bootRun
# http://localhost:8080
```

### 환경 설정

로컬 개발에 필요한 값은 `frontend/.env.development` 와 `studymate/src/main/resources/application.properties` 의 기본값으로 이미 채워져 있어 별도 설정 없이 실행된다.
배포 시에는 아래 환경변수로 덮어쓴다.

| 환경변수 | 설명 |
|---|---|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | PostgreSQL 접속 정보 |
| `FIREBASE_CREDENTIALS_JSON` | 서비스 계정 JSON 문자열 (파일 대신 사용) |
| `APP_CORS_ALLOWED_ORIGINS` | 허용할 프론트엔드 주소 (콤마 구분, CORS·WebSocket 공통) |
| `APP_ALLOWED_EMAIL_DOMAIN` | 가입 허용 학교 도메인 (기본 `@sch.ac.kr`) |
| `APP_ADMIN_EMAILS` | 관리자 이메일 (콤마 구분). 도메인 제한을 우회하며 문의 관리 권한을 갖는다 |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | 문의 알림 발송용 Gmail 계정 / 앱 비밀번호 |
| `DDL_AUTO` | 운영에서는 `validate` 권장 (기본 `update`) |

프론트엔드는 `REACT_APP_API_BASE`, `REACT_APP_WS_URL`, `REACT_APP_FIREBASE_*` 를 `.env.development` / `.env.production` 에서 읽는다.

전체 배포 절차는 [DEPLOY.md](DEPLOY.md) 참고.

### 프론트엔드
```bash
cd frontend
npm install
npm start
# http://localhost:3000
```

### DB 접속 (psql)
```bash
docker exec -it studymate-postgres psql -U studymate -d studymate
```
- 테스트(`./gradlew test`)는 PostgreSQL 없이도 동작합니다 (H2 인메모리 PostgreSQL 호환 모드 사용).
