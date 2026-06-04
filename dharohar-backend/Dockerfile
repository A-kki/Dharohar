# Build stage
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies in a separate layer
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Run stage
FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/dharohar-backend-*.jar app.jar

# Setup upload folder volume
RUN mkdir -p /app/uploads
VOLUME /app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
