'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';

// --- CONFIGURATION DES ICONES ---

// Icône BLEUE (Zone 0)
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
    zoneId?: number;       // La zone calculée par K-Means
    deliveryIndex?: number; // L'ordre de passage calculé par TSP
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

    // Charger au démarrage et rafraîchir toutes les 2 secondes
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 2000); 
        return () => clearInterval(interval);
    }, []);

    // --- LOGIQUE DE TRACÉ DES ROUTES (ROUTING) ---
    
    // 1. Filtrer et Trier les commandes par Zone ET par Ordre de passage (deliveryIndex)
    const zone0Orders = orders
        .filter(o => o.zoneId === 0)
        .sort((a, b) => (a.deliveryIndex || 0) - (b.deliveryIndex || 0));

    const zone1Orders = orders
        .filter(o => o.zoneId === 1)
        .sort((a, b) => (a.deliveryIndex || 0) - (b.deliveryIndex || 0));

    // 2. Extraire les coordonnées pour les lignes Leaflet [lat, lon]
    const routeZone0 = zone0Orders.map(o => [o.latitude, o.longitude] as [number, number]);
    const routeZone1 = zone1Orders.map(o => [o.latitude, o.longitude] as [number, number]);

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
            
            {/* --- LIGNES DE TRAJET (ROUTING) --- */}
            
            {/* Ligne Bleue pour Zone 0 */}
            <Polyline positions={routeZone0} color="blue" weight={4} opacity={0.7} dashArray="10, 10" />
            
            {/* Ligne Rouge pour Zone 1 */}
            <Polyline positions={routeZone1} color="red" weight={4} opacity={0.7} dashArray="10, 10" />


            {/* --- MARQUEURS --- */}
            {orders.map((order) => (
                <Marker 
                    key={order.id} 
                    position={[order.latitude, order.longitude]} 
                    icon={order.zoneId === 1 ? iconRed : iconBlue}
                >
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">{order.customerName}</h3>
                            <div className="text-sm text-gray-600 mb-2">
                                {order.zoneId !== undefined ? 
                                    <span className={`px-2 py-1 rounded text-white ${order.zoneId === 1 ? 'bg-red-500' : 'bg-blue-500'}`}>
                                        Zone {order.zoneId}
                                    </span> 
                                    : <span className="bg-yellow-500 text-white px-2 py-1 rounded">Calcul...</span>
                                }
                            </div>
                            
                            {/* Affichage de l'ordre de passage */}
                            {order.deliveryIndex && (
                                <p className="font-bold text-lg my-1">
                                    📦 Stop N° {order.deliveryIndex}
                                </p>
                            )}
                            
                            <hr className="my-2"/>
                            <p>Prix: {order.price} MAD</p>
                            <p className="text-xs text-gray-400">ID: {order.id}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;