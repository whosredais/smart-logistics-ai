# 🚛 Smart Logistics AI Platform

Une plateforme logistique intelligente utilisant une architecture Microservices pour optimiser les tournées de livraison grâce au Machine Learning.

## 🚀 Fonctionnalités Actuelles (V1)
* **Microservices Architecture :** Séparation claire entre le Core (Java) et l'IA (Python).
* **Event-Driven :** Communication asynchrone via RabbitMQ.
* **AI Clustering :** Algorithme K-Means (Scikit-Learn) pour regrouper les commandes par zones géographiques.
* **Real-Time Dashboard :** Visualisation interactive sur carte (Next.js + Leaflet).
* **Infrastructure :** Dockerisation complète (PostgreSQL + PostGIS, RabbitMQ).

## 🗺️ Roadmap (Prochaines étapes)
* [ ] **Routing Intelligent (TSP) :** Calcul du chemin optimal intra-zone.
* [ ] **Fleet Service :** Gestion de la disponibilité des livreurs.
* [ ] **WebSockets :** Suivi temps réel sans polling.

## 🛠️ Tech Stack
* **Backend :** Spring Boot 3 (Java 21)
* **AI Engine :** Python (FastAPI, Scikit-learn, Numpy)
* **Frontend :** Next.js 14, TailwindCSS, React-Leaflet
* **Database :** PostgreSQL 15 + PostGIS
* **Messaging :** RabbitMQ
* **DevOps :** Docker Compose

## 📦 Comment lancer le projet

1. **Lancer l'infrastructure :**
   ```bash
   docker-compose up -d
   ```

2. **Lancer le Order Service (Java) :**
   ```bash
   cd order-service
   ./mvnw spring-boot:run
   ```

3. **Lancer le AI Engine (Python) :**
   ```bash
   cd optimization-service
   source venv/bin/activate
   python consumer.py
   ```

4. **Lancer le Frontend :**
   ```bash
   cd frontend
   npm run dev
   ```