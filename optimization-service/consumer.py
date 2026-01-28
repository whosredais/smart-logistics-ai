import pika
import json
import time
import numpy as np
import requests
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist # Pour calculer les distances

# CONFIGURATION
RABBITMQ_HOST = 'localhost'
QUEUE_NAME = 'orders.queue'
BATCH_SIZE = 3 
N_CLUSTERS = 2 

orders_buffer = []

def solve_tsp_nearest_neighbor(points):
    """
    Algorithme du plus proche voisin.
    Entrée: liste de coordonnées [[lat, lon], [lat, lon]...]
    Sortie: liste des indices ordonnés [0, 2, 1...]
    """
    if len(points) == 0:
        return []
    
    # On commence par le premier point de la liste (arbitraire)
    current_idx = 0
    path = [current_idx]
    visited = {current_idx}
    
    while len(visited) < len(points):
        last_point = points[current_idx].reshape(1, -1)
        
        # Calculer les distances vers tous les autres points
        distances = cdist(last_point, points, metric='euclidean')[0]
        
        # Mettre une distance infinie pour les points déjà visités (pour ne pas les rechoisir)
        for i in range(len(points)):
            if i in visited:
                distances[i] = np.inf
        
        # Trouver le plus proche
        nearest_idx = np.argmin(distances)
        
        # Ajouter au chemin
        path.append(nearest_idx)
        visited.add(nearest_idx)
        current_idx = nearest_idx
        
    return path

def process_batch():
    print(f"\n--- 🧠 LANCEMENT DE L'OPTIMISATION IA (K-Means + TSP) ---")
    
    if not orders_buffer:
        return

    # 1. K-Means pour faire les Zones
    coords = np.array([[o['latitude'], o['longitude']] for o in orders_buffer])
    kmeans = KMeans(n_clusters=N_CLUSTERS, n_init=10)
    kmeans.fit(coords)
    labels = kmeans.labels_ # ex: [0, 1, 0]
    
    print(f"📊 Calcul des routes optimales...")
    
    # 2. Pour chaque Zone, on calcule le chemin optimal (TSP)
    for zone_id in range(N_CLUSTERS):
        # On récupère les indices des commandes qui sont dans cette zone
        indices_in_zone = [i for i, label in enumerate(labels) if label == zone_id]
        
        if not indices_in_zone:
            continue
            
        # On extrait les coordonnées de ces commandes
        zone_coords = coords[indices_in_zone]
        
        # On applique le TSP sur cette zone
        sorted_indices_local = solve_tsp_nearest_neighbor(zone_coords)
        
        # 3. On sauvegarde le résultat en Java
        print(f"  📍 Traitement Zone {zone_id} ({len(indices_in_zone)} commandes)")
        
        for sequence_number, local_idx in enumerate(sorted_indices_local):
            global_idx = indices_in_zone[local_idx] # Retrouver l'index d'origine
            order = orders_buffer[global_idx]
            
            # On envoie : La Zone + L'ordre de passage (deliveryIndex)
            try:
                # Note: On triche un peu, on utilise le endpoint "zone" pour tout envoyer
                # Idéalement il faudrait modifier l'API Java pour accepter un objet JSON plus complexe
                # Mais pour aller vite, on va modifier OrderController pour lire "deliveryIndex" s'il existe
                url = f"http://localhost:8081/api/orders/{order['id']}/zone"
                payload = {
                    "zoneId": int(zone_id),
                    "deliveryIndex": sequence_number + 1 # 1er, 2ème...
                }
                requests.put(url, json=payload)
                print(f"    ✅ {sequence_number+1}. {order['customerName']}")
                
            except Exception as e:
                print(f"    ❌ Erreur API: {e}")

    print("---------------------------------------------------\n")
    orders_buffer.clear()


def process_order(ch, method, properties, body):
    try:
        data = json.loads(body)
        if isinstance(data, str): return

        print(f" [x] Reçu ID: {data.get('id')} - {data.get('customerName')}")
        orders_buffer.append(data)
        
        if len(orders_buffer) >= BATCH_SIZE:
            process_batch()
            
    except Exception as e:
        print(f" [!] Erreur: {e}")

def start_consuming():
    print(f" [*] IA (TSP Routing) en attente... (Batch: {BATCH_SIZE})")
    connection_params = pika.ConnectionParameters(host=RABBITMQ_HOST, port=5672, credentials=pika.PlainCredentials('guest', 'guest'))
    try:
        connection = pika.BlockingConnection(connection_params)
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_order, auto_ack=True)
        channel.start_consuming()
    except Exception as e:
        print(f"Erreur RabbitMQ: {e}")
        time.sleep(5)
        start_consuming()

if __name__ == "__main__":
    start_consuming()