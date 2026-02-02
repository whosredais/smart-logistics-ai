# 🚛 Smart Logistics AI Platform

Une plateforme de logistique intelligente "Fullstack" utilisant une architecture Microservices pour optimiser les tournées de livraison en temps réel grâce au Machine Learning.

Ce projet démontre une intégration complexe entre **Java Spring Boot**, **Python AI**, **Next.js** et **RabbitMQ**, le tout orchestré par **Docker**.

## 🚀 Fonctionnalités Clés
* **Architecture Microservices :** Découplage strict avec 3 services distincts (Order Service, Fleet Service, AI Engine).
* **AI Optimization :**
  * **Clustering (K-Means) :** Regroupement géographique intelligent des commandes.
  * **Routing (TSP) :** Calcul du chemin optimal (Algorithme du Voyageur de Commerce) pour minimiser les distances.
  * **Smart Assignment :** Attribution automatique des livreurs selon leur zone de responsabilité.
* **Real-Time Tracking (WebSockets) :** Le Dashboard Frontend est mis à jour instantanément (Push) sans rechargement, grâce à **STOMP/SockJS**.
* **Event-Driven Architecture :** Communication asynchrone et résiliente via **RabbitMQ**.
* **Database Isolation :** Pattern "Database per Service" respecté (2 bases PostgreSQL distinctes pour les Commandes et la Flotte).
* **Docker Orchestration :** Lancement de l'intégralité de la stack (6 conteneurs) en une seule commande.

## 🛠️ Tech Stack
* **Backend :** Java 21, Spring Boot 3 (Spring Data JPA, Spring Web, WebSocket).
* **AI Engine :** Python 3.10 (Scikit-learn, Numpy, Scipy, Pika, Requests).
* **Frontend :** Next.js 16 (React), TailwindCSS, React-Leaflet, SockJS.
* **Databases :** PostgreSQL 15 + PostGIS (x2 instances).
* **Message Broker :** RabbitMQ (Management Plugin).
* **DevOps :** Docker & Docker Compose.

## 📦 Statut du Projet & Roadmap
- [x] **Microservices Core :** Communication inter-services et bases de données isolées.
- [x] **AI Clustering :** K-Means pour regrouper les commandes par zones.
- [x] **Routing Intelligent (TSP) :** Tracé du chemin optimal entre les points de livraison.
- [x] **Fleet Service :** Gestion des livreurs et assignation dynamique via API.
- [x] **WebSockets :** Dashboard temps réel (KPIs, Logs, Carte).
- [x] **Full Dockerization :** Conteneurisation de tous les services (Java, Python, Next.js, DBs).

## 🏃‍♂️ Installation & Lancement (Docker)

Le projet est entièrement "Dockerisé". Vous n'avez besoin que de Docker installé sur votre machine.

1. **Cloner le projet :**
   ```bash
   git clone [https://github.com/ton-pseudo/smart-logistics-ai.git](https://github.com/ton-pseudo/smart-logistics-ai.git)
   cd smart-logistics-ai
   ```

2. **Lancer l'application :**
   ```bash
   docker-compose up --build
   ```   
   Cela va compiler les projets Java (Maven), installer les dépendances Python/Node, et lancer les bases de données.

3. **Accéder au Dashboard :**   
   Ouvrez votre navigateur sur : http://localhost:3000


## 🧪 Tester l'Intelligence Artificielle
   Une fois le Dashboard ouvert, simulez des commandes via l'API (ou Postman/Curl) pour voir l'IA réagir en direct :
    
   # 1. Commande Nord (Zone 1)
curl -X POST http://localhost:8081/api/orders -H "Content-Type: application/json" -d "{\"customerName\": \"Casa Port\", \"latitude\": 33.5950, \"longitude\": -7.6180, \"price\": 100}"

# 2. Commande Sud (Zone 0)
curl -X POST http://localhost:8081/api/orders -H "Content-Type: application/json" -d "{\"customerName\": \"Sidi Maarouf\", \"latitude\": 33.5200, \"longitude\": -7.6400, \"price\": 200}"

# 3. Commande Centre (Zone 1) -> Déclenche l'optimisation
curl -X POST http://localhost:8081/api/orders -H "Content-Type: application/json" -d "{\"customerName\": \"2 Mars\", \"latitude\": 33.5600, \"longitude\": -7.6100, \"price\": 150}"
   
   👀 Observez le Dashboard : Les points vont s'afficher, changer de couleur, être reliés par une route optimale, et le livreur (Karim/Sarah) sera assigné automatiquement.

   
## 👨‍💻 Author

Full Stack Developer & AI Enthusiast

LinkedIn Profile : https://www.linkedin.com/in/mohamed-reda-boujir-a62087294/

---