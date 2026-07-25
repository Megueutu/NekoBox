FROM eclipse-temurin:21.0.8_9-jdk-jammy AS build

WORKDIR /workspace

COPY backend/api/.mvn .mvn
COPY backend/api/mvnw backend/api/pom.xml ./
RUN chmod 0555 mvnw \
    && ./mvnw -q dependency:go-offline

COPY backend/api/src src
RUN ./mvnw -q -DskipTests package

FROM eclipse-temurin:21.0.8_9-jre-alpine

WORKDIR /app

RUN addgroup -S nekobox \
    && adduser -S -G nekobox nekobox

COPY --from=build --chown=nekobox:nekobox \
    /workspace/target/marketplace-project-0.0.1-SNAPSHOT.jar \
    /app/nekobox-api.jar

USER nekobox

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/nekobox-api.jar"]
