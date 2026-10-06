# ── 1단계: 빌드 ─────────────────────────────────────────────
FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

# 의존성 캐시를 위해 빌드 스크립트를 먼저 복사한다
COPY gradle gradle
COPY gradlew settings.gradle build.gradle ./
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies || true

COPY src src
RUN ./gradlew --no-daemon clean bootJar -x test

# ── 2단계: 실행 ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/build/libs/*.jar app.jar

# Cloud Run이 주입하는 PORT를 그대로 사용한다 (application.properties의 server.port)
ENV PORT=8080
EXPOSE 8080

# 컨테이너 메모리에 맞춰 힙을 잡는다
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
