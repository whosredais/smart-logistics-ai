# Étape 1 : Build (Compilation avec Maven)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compile et crée le .jar sans lancer les tests (pour aller plus vite)
RUN mvn clean package -DskipTests

# Étape 2 : Run (Image légère pour l'exécution)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# On récupère le .jar compilé à l'étape précédente
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]