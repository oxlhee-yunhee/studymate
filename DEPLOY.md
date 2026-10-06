# StudyMate 배포 가이드

프론트엔드는 **Firebase Hosting**, 백엔드는 **Cloud Run**, 데이터베이스는 **Neon Postgres**에 올린다.
학내 프로젝트 규모에서는 전부 무료 한도 안에서 돌아간다. (단, Cloud Run은 무료 한도를 쓰더라도 결제 수단 등록이 필요하다)

| 구성 요소 | 서비스 | 무료 한도 |
|---|---|---|
| React | Firebase Hosting | 저장 10GB / 전송 하루 360MB |
| 로그인 | Firebase Authentication | 무료 |
| Spring Boot | Cloud Run | 월 200만 요청, 180k vCPU-초, 360k GiB-초 |
| PostgreSQL | Neon | 무료 플랜 |

---

## 0. 배포 전 체크

- [ ] `cd studymate && ./gradlew build` 가 로컬에서 통과한다
- [ ] `cd frontend && npm run build` 가 통과한다
- [ ] `studymate/build.gradle.bak` 같은 임시 파일을 지웠다
- [ ] `config/firebase/serviceAccount.json` 과 `application-local.properties` 가 git에 올라가지 않는다

---

## 1. Neon Postgres 만들기

1. https://neon.com 가입 → 프로젝트 생성 (리전은 **Asia Pacific (Seoul)** 또는 가장 가까운 곳)
2. 데이터베이스 이름을 `studymate` 로 만든다
3. Connection string을 복사한다. 형태는 아래와 같다.

```
postgresql://<user>:<password>@ep-xxxx-xxxx.ap-southeast-1.aws.neon.tech/studymate?sslmode=require
```

4. 이 값을 JDBC 형식으로 나눠 둔다. **Cloud Run 환경변수에 이렇게 들어간다.**

```
DB_URL=jdbc:postgresql://ep-xxxx-xxxx.ap-southeast-1.aws.neon.tech/studymate?sslmode=require&channelBinding=require
DB_USERNAME=<user>
DB_PASSWORD=<password>
```

> `sslmode=require` 는 Neon에서 필수다. 빼면 연결이 거부된다.

---

## 2. Google Cloud 준비

```bash
# gcloud CLI 설치 후
gcloud auth login
gcloud config set project studymate-69ac7

# 결제 계정 연결(Blaze)은 콘솔에서 한 번 해줘야 한다
# https://console.cloud.google.com/billing

# 필요한 API 켜기
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com
```

---

## 3. 비밀값을 Secret Manager에 넣기

Firebase 서비스 계정 키와 Gmail 앱 비밀번호는 환경변수로 직접 넣지 말고 시크릿으로 관리한다.
(서비스 계정 JSON은 줄바꿈과 쉼표가 많아서 `--set-env-vars` 로 넣으면 깨진다)

```bash
# Firebase 서비스 계정 키
gcloud secrets create firebase-sa --data-file=config/firebase/serviceAccount.json

# DB 비밀번호
printf '%s' '<neon-password>' | gcloud secrets create db-password --data-file=-

# Gmail 앱 비밀번호 (문의하기 메일 발송용)
printf '%s' '<gmail-app-password>' | gcloud secrets create mail-password --data-file=-
```

---

## 4. 백엔드를 Cloud Run에 배포

```bash
gcloud run deploy studymate-api \
  --source studymate \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --timeout 3600 \
  --set-env-vars "DB_URL=jdbc:postgresql://ep-xxxx.aws.neon.tech/studymate?sslmode=require&channelBinding=require" \
  --set-env-vars "DB_USERNAME=<user>" \
  --set-env-vars "APP_ALLOWED_EMAIL_DOMAIN=@sch.ac.kr" \
  --set-env-vars "APP_ADMIN_EMAILS=dbsgml0379@naver.com" \
  --set-env-vars "MAIL_USERNAME=<발신용Gmail주소>" \
  --set-env-vars "DDL_AUTO=update" \
  --set-env-vars "SHOW_SQL=false" \
  --set-secrets "FIREBASE_CREDENTIALS_JSON=firebase-sa:latest" \
  --set-secrets "DB_PASSWORD=db-password:latest" \
  --set-secrets "MAIL_PASSWORD=mail-password:latest"
```

배포가 끝나면 `https://studymate-api-xxxxxxxx.asia-northeast3.run.app` 같은 주소가 나온다. **이 주소를 적어둔다.**

각 옵션의 이유:

- `--timeout 3600` : 기본값 300초면 채팅 WebSocket 연결이 5분마다 끊긴다. 최대 60분으로 늘린다
- `--min-instances 0` : 아무도 안 쓸 때 0으로 내려가서 요금이 안 나온다. 대신 첫 요청에 콜드 스타트가 10~20초 걸린다
- `--max-instances 3` : 무한 확장으로 요금이 폭주하는 것을 막는 안전장치
- `DDL_AUTO=update` : 첫 배포에서 테이블을 자동 생성한다. **스키마가 만들어진 뒤에는 `validate` 로 바꾸는 것을 권장**한다

```bash
# 스키마가 정상 생성된 것을 확인한 뒤
gcloud run services update studymate-api --region asia-northeast3 \
  --update-env-vars DDL_AUTO=validate
```

---

## 5. 프론트엔드 배포

`frontend/.env.production` 의 `CHANGE_ME` 두 줄을 4단계에서 받은 Cloud Run 주소로 바꾼다.

```
REACT_APP_API_BASE=https://studymate-api-xxxxxxxx.asia-northeast3.run.app/api
REACT_APP_WS_URL=https://studymate-api-xxxxxxxx.asia-northeast3.run.app/ws-chat
```

그다음 빌드하고 올린다.

```bash
npm install -g firebase-tools
firebase login

cd frontend && npm run build && cd ..
firebase deploy --only hosting
```

배포되면 `https://studymate-69ac7.web.app` 주소가 나온다.

---

## 6. 두 주소를 서로 연결하기 (빠뜨리기 쉬움)

### 6-1. 백엔드에 프론트 주소를 CORS로 허용

```bash
gcloud run services update studymate-api --region asia-northeast3 \
  --update-env-vars "APP_CORS_ALLOWED_ORIGINS=https://studymate-69ac7.web.app,https://studymate-69ac7.firebaseapp.com"
```

이 값은 CORS와 WebSocket 허용 출처에 함께 쓰인다. 빠뜨리면 로그인은 되는데 API가 전부 막힌다.

### 6-2. Firebase Auth 승인된 도메인 확인

Firebase 콘솔 → Authentication → Settings → 승인된 도메인에
`studymate-69ac7.web.app` 이 있는지 확인한다. (보통 자동으로 들어가 있다)

---

## 7. 요금 안전장치

1. https://console.cloud.google.com/billing → 예산 및 알림 → **예산 1,000원 + 알림 50%/90%/100%** 설정
2. `--max-instances 3` 유지
3. 채팅 WebSocket은 연결이 살아있는 동안 CPU 시간을 쓴다. 사용자가 늘면 여기가 먼저 한도를 먹으므로 월말에 Cloud Run 사용량을 한 번 확인한다

---

## 8. 배포 후 동작 확인

- [ ] `@sch.ac.kr` 계정으로 회원가입 → 인증 메일 → 로그인이 된다
- [ ] 인증 메일을 안 눌렀을 때 로그인이 막힌다
- [ ] 스터디 생성/검색/찜하기가 된다
- [ ] 참여 신청 → 방장 승인 → 알림이 온다
- [ ] 채팅방에 들어가서 메시지를 주고받으면 상대에게 실시간으로 보인다
- [ ] 5분 넘게 채팅방을 열어둬도 연결이 유지된다 (`--timeout 3600` 확인)
- [ ] 관리자 이메일(`APP_ADMIN_EMAILS`)로 로그인하면 마이페이지에 문의 관리 메뉴가 보인다
- [ ] 로그아웃 상태에서 `curl https://<백엔드주소>/api/studies` 를 하면 **401** 이 온다

마지막 항목이 200을 주면 인증이 걸리지 않은 것이므로 배포를 멈추고 확인해야 한다.

---

## 9. 자주 겪는 문제

| 증상 | 원인 |
|---|---|
| 모든 API가 CORS 오류 | 6-1의 `APP_CORS_ALLOWED_ORIGINS` 미설정 |
| 로그인은 되는데 API가 401 | 백엔드에 Firebase 자격 증명이 없음 → `FIREBASE_CREDENTIALS_JSON` 시크릿 확인 |
| 첫 요청이 20초씩 걸림 | Cloud Run 콜드 스타트. 정상이며, 급하면 `--min-instances 1` (유료) |
| 채팅이 5분마다 끊김 | `--timeout` 이 기본값 300초 |
| DB 연결 실패 | `DB_URL` 에 `sslmode=require` 누락 |
| 스터디 목록이 느림 | 대표이미지를 base64로 DB에 저장 중. 이미지가 쌓이면 목록 응답이 수 MB가 된다 (개선 필요) |
