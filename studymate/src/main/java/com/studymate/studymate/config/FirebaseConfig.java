package com.studymate.studymate.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Firebase Admin SDK 초기화.
 *
 * 자격 증명은 아래 순서로 찾는다.
 *  1) FIREBASE_CREDENTIALS_JSON  : 서비스 계정 JSON 문자열 (Cloud Run 등 파일을 둘 수 없는 환경용)
 *  2) FIREBASE_CONFIG_PATH       : 서비스 계정 파일 경로 (로컬 기본값 config/firebase/serviceAccount.json)
 *  3) Application Default Credentials (Google Cloud 위에서 실행 중인 경우)
 *
 * 셋 다 실패하면 앱을 띄우지 않는다.
 * 인증 전체가 이 자격 증명에 달려 있어서, 조용히 넘어가면 모든 요청이 401이 되고
 * 원인을 찾기 어려워지기 때문이다.
 */
@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.config-path:}")
    private Resource firebaseResource;

    @Value("${FIREBASE_CREDENTIALS_JSON:}")
    private String credentialsJson;

    /** 테스트처럼 자격 증명 없이 컨텍스트만 띄워야 할 때 false로 둔다. */
    @Value("${firebase.enabled:true}")
    private boolean firebaseEnabled;

    @PostConstruct
    public void initFirebase() {
        if (!firebaseEnabled) {
            log.warn("firebase.enabled=false — Firebase 초기화를 건너뜁니다 (인증 기능 사용 불가)");
            return;
        }
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        GoogleCredentials credentials = loadCredentials();
        FirebaseApp.initializeApp(FirebaseOptions.builder()
                .setCredentials(credentials)
                .build());
        log.info("Firebase Admin SDK 초기화 완료");
    }

    private GoogleCredentials loadCredentials() {
        // 1) 환경변수로 주입된 JSON
        if (credentialsJson != null && !credentialsJson.isBlank()) {
            try (InputStream in = new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8))) {
                log.info("Firebase 자격 증명: 환경변수(FIREBASE_CREDENTIALS_JSON) 사용");
                return GoogleCredentials.fromStream(in);
            } catch (Exception e) {
                throw new IllegalStateException(
                        "FIREBASE_CREDENTIALS_JSON 값을 읽지 못했습니다: " + e.getMessage(), e);
            }
        }

        // 2) 서비스 계정 파일
        if (firebaseResource != null && firebaseResource.exists()) {
            try (InputStream in = firebaseResource.getInputStream()) {
                log.info("Firebase 자격 증명: 서비스 계정 파일 사용");
                return GoogleCredentials.fromStream(in);
            } catch (Exception e) {
                throw new IllegalStateException(
                        "Firebase 서비스 계정 파일을 읽지 못했습니다: " + e.getMessage(), e);
            }
        }

        // 3) Google Cloud 기본 자격 증명
        try {
            log.info("Firebase 자격 증명: Application Default Credentials 사용");
            return GoogleCredentials.getApplicationDefault();
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Firebase 자격 증명을 찾을 수 없습니다. "
                            + "FIREBASE_CREDENTIALS_JSON 환경변수를 설정하거나 "
                            + "config/firebase/serviceAccount.json 파일을 두세요.", e);
        }
    }
}
