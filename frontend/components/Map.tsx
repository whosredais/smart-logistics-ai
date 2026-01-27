'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';

// --- CONFIGURATION DES ICONES ---

// Icône BLEUE (Par défaut ou Zone 0)
const iconBlue = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Icône ROUGE (Zone 1)
const iconRed = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- TYPE DE DONNÉES ---
interface Order {
    id: number;
    customerName: string;
    latitude: number;
    longitude: number;
    status: string;
    price: number;
    zoneId?: number; // Peut être null au début
}

const MapComponent = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    // Fonction pour récupérer les commandes depuis Java
    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Erreur chargement commandes:", error);
        }
    };

    // Charger au démarrage et rafraîchir toutes les 2 secondes (Temps réel)
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 2000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <MapContainer 
            center={[33.5731, -7.5898]} // Centre sur Casablanca
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            
            {orders.map((order) => (
                <Marker 
                    key={order.id} 
                    position={[order.latitude, order.longitude]} 
                    // LOGIQUE INTELLIGENTE : Si Zone 1 = Rouge, sinon Bleu
                    icon={order.zoneId === 1 ? iconRed : iconBlue}
                >
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">{order.customerName}</h3>
                            <p>Statut: <span className="font-mono">{order.status}</span></p>
                            <p>Prix: {order.price} MAD</p>
                            <hr className="my-2"/>
                            {/* Affichage conditionnel de la zone */}
                            <p className="font-bold">
                                {order.zoneId !== undefined && order.zoneId !== null
                                    ? `📍 Zone Assignée : ${order.zoneId}` 
                                    : "⏳ Calcul IA en cours..."}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;