import pika
import json
import time
import numpy as np
import requests
from sklearn.cluster import KMeans

# CONFIGURATION
RABBITMQ_HOST = 'localhost'
QUEUE_NAME = 'orders.queue'
BATCH_SIZE = 3  # On lance l'IA toutes les 3 commandes reçues (pour la démo)
N_CLUSTERS = 2  # On veut diviser les commandes en 2 groupes de livreurs

# Stockage temporaire des commandes en mémoire
orders_buffer = []

def process_batch():
    print(f"\n--- 🧠 LANCEMENT DE L'OPTIMISATION IA (K-Means) ---")
    
    if not orders_buffer:
        return

    coords = np.array([[o['latitude'], o['longitude']] for o in orders_buffer])
    
    kmeans = KMeans(n_clusters=N_CLUSTERS, n_init=10)
    kmeans.fit(coords)
    labels = kmeans.labels_
    
    print(f"📊 Mise à jour des résultats vers Java...")
    
    for i, order in enumerate(orders_buffer):
        cluster_id = int(labels[i]) # Convertir numpy.int en int Python standard
        order_id = order['id']
        
        # APPEL A JAVA POUR SAUVEGARDER LE RESULTAT
        try:
            url = f"http://localhost:8081/api/orders/{order_id}/zone"
            payload = {"zoneId": cluster_id}
            response = requests.put(url, json=payload)
            
            if response.status_code == 200:
                print(f"  ✅ Commande {order_id} -> Zone {cluster_id} (Sauvegardé en BDD)")
            else:
                print(f"  ❌ Erreur sauvegarde commande {order_id}")
                
        except Exception as e:
            print(f"  ❌ Erreur connexion API Java: {e}")
        
    print("---------------------------------------------------\n")
    orders_buffer.clear()

def process_order(ch, method, properties, body):
    try:
        # Décodage du message
        data = json.loads(body)
        
        # Sécurité : Si c'est le message de test (string), on l'ignore
        if isinstance(data, str):
            print(" [!] Message de test ignoré.")
            return

        print(f" [x] Reçu Commande ID: {data.get('id')} - Client: {data.get('customerName')}")
        
        # Ajout au buffer
        orders_buffer.append(data)
        
        # Si on a assez de commandes, on lance l'IA
        if len(orders_buffer) >= BATCH_SIZE:
            process_batch()
            
    except Exception as e:
        print(f" [!] Erreur de traitement : {e}")

def start_consuming():
    print(f" [*] IA en attente de commandes... (Batch size: {BATCH_SIZE})")
    
    connection_params = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=5672,
        credentials=pika.PlainCredentials('guest', 'guest')
    )
    
    try:
        connection = pika.BlockingConnection(connection_params)
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        channel.basic_consume(queue=QUEUE_NAME, on_message_callback=process_order, auto_ack=True)
        channel.start_consuming()
    except Exception as e:
        print(f"Erreur connexion RabbitMQ: {e}")
        time.sleep(5)
        start_consuming()

if __name__ == "__main__":
    start_consuming()