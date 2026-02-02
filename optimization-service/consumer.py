import pika
import json
import time
import numpy as np
import requests
import os
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist

# --- CONFIGURATION (DOCKER READY) ---
# Si on est dans Docker, on utilise les noms des services. Sinon, localhost.
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
ORDER_SERVICE_URL = os.getenv('ORDER_SERVICE_URL', 'http://localhost:8081')
FLEET_SERVICE_URL = os.getenv('FLEET_SERVICE_URL', 'http://localhost:8082')

QUEUE_NAME = 'orders.queue'
BATCH_SIZE = 3 
N_CLUSTERS = 2 

orders_buffer = []

def solve_tsp_nearest_neighbor(points):
    """ Algorithme TSP (Voyageur de commerce) """
    if len(points) == 0: return []
    current_idx = 0
    path = [current_idx]
    visited = {current_idx}
    while len(visited) < len(points):
        last_point = points[current_idx].reshape(1, -1)
        distances = cdist(last_point, points, metric='euclidean')[0]
        for i in range(len(points)):
            if i in visited: distances[i] = np.inf
        nearest_idx = np.argmin(distances)
        path.append(nearest_idx)
        visited.add(nearest_idx)
        current_idx = nearest_idx
    return path

def process_batch():
    print(f"\n--- 🧠 LANCEMENT DE L'OPTIMISATION IA (K-Means + TSP + Fleet) ---")
    
    if not orders_buffer: return

    # 1. K-Means
    coords = np.array([[o['latitude'], o['longitude']] for o in orders_buffer])
    kmeans = KMeans(n_clusters=N_CLUSTERS, n_init=10)
    kmeans.fit(coords)
    labels = kmeans.labels_
    
    print(f"📊 Assignation intelligente en cours...")
    
    for zone_id in range(N_CLUSTERS):
        # 2. APPEL AU FLEET SERVICE (Via URL dynamique)
        driver_name = "En attente"
        try:
            fleet_url = f"{FLEET_SERVICE_URL}/api/drivers/zone/{zone_id}"
            resp = requests.get(fleet_url)
            if resp.status_code == 200 and resp.json():
                driver_data = resp.json()
                driver_name = f"{driver_data['name']} ({driver_data['vehicle']})"
            else:
                driver_name = "Aucun livreur dispo"
        except Exception as e:
            print(f"  ⚠️ Erreur Fleet Service: {e}")

        # 3. Calcul du trajet
        indices_in_zone = [i for i, label in enumerate(labels) if label == zone_id]
        if not indices_in_zone: continue
        
        zone_coords = coords[indices_in_zone]
        sorted_indices_local = solve_tsp_nearest_neighbor(zone_coords)
        
        print(f"  📍 Zone {zone_id} attribuée à : {driver_name}")
        
        for sequence_number, local_idx in enumerate(sorted_indices_local):
            global_idx = indices_in_zone[local_idx]
            order = orders_buffer[global_idx]
            
            # 4. MISE À JOUR ORDER SERVICE (Via URL dynamique)
            try:
                url = f"{ORDER_SERVICE_URL}/api/orders/{order['id']}/zone"
                payload = {
                    "zoneId": int(zone_id),
                    "deliveryIndex": sequence_number + 1,
                    "driverName": driver_name
                }
                requests.put(url, json=payload)
                print(f"    ✅ {sequence_number+1}. {order['customerName']} -> {driver_name}")
            except Exception as e:
                print(f"    ❌ Erreur API Java: {e}")

    print("---------------------------------------------------\n")
    orders_buffer.clear()

def process_order(ch, method, properties, body):
    try:
        data = json.loads(body)
        if isinstance(data, str): return
        print(f" [x] Reçu ID: {data.get('id')} - {data.get('customerName')}")
        orders_buffer.append(data)
        if len(orders_buffer) >= BATCH_SIZE: process_batch()
    except Exception as e:
        print(f" [!] Erreur: {e}")

def start_consuming():
    print(f" [*] IA prête. Connexion à RabbitMQ ({RABBITMQ_HOST})...")
    connection_params = pika.ConnectionParameters(host=RABBITMQ_HOST, port=5672, credentials=pika.PlainCredentials('guest', 'guest'))
    
    while True:
        try:
            connection = pika.BlockingConnection(connection_params)
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_order, auto_ack=True)
            print(" [*] Connecté ! En attente de commandes...")
            channel.start_consuming()
        except Exception as e:
            print(f" [!] Connexion RabbitMQ échouée ({e}). Nouvelle tentative dans 5s...")
            time.sleep(5)

if __name__ == "__main__":
    start_consuming()