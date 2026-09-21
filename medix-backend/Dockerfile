# Stage 1: Build the application with dependency layer caching
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Expose the jar in a lightweight JRE container with JVM startup optimizations
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/medimind-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+TieredCompilation", "-XX:TieredStopAtLevel=1", "-XX:MaxRAMPercentage=75.0", "-Xss256k", "-jar", "app.jar"]

