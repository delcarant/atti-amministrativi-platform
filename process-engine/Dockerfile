# Stage 1: Build con Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
# Copia il POM padre e tutti i moduli per ottimizzare il layer cache
COPY pom.xml .
COPY process-engine/pom.xml process-engine/
RUN mvn -B dependency:go-offline -pl process-engine -am
COPY process-engine/src process-engine/src
RUN mvn -B package -pl process-engine -am -DskipTests

# Stage 2: Runtime image JVM
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/process-engine/target/quarkus-app/lib/ /app/lib/
COPY --from=build /build/process-engine/target/quarkus-app/*.jar /app/
COPY --from=build /build/process-engine/target/quarkus-app/app/ /app/app/
COPY --from=build /build/process-engine/target/quarkus-app/quarkus/ /app/quarkus/
EXPOSE 8080
ENV JAVA_OPTS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
CMD ["java", "-jar", "/app/quarkus-run.jar"]
