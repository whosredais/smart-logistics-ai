'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';
// Imports WebSocket
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// --- CONFIGURATION DES ICONES ---
const iconBlue = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const iconRed = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface Order {
    id: number;
    customerName: string;
    latitude: number;
    longitude: number;
    status: string;
    price: number;
    zoneId?: number;
    deliveryIndex?: number;
    driverName?: string;
}

const MapComponent = () => {
    const [orders, setOrders] = useState<Order[]>([]);

    // Chargement initial (HTTP classique)
    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8081/api/orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Erreur chargement commandes:", error);
        }
    };

    // Connexion WebSocket
    useEffect(() => {
        // 1. On charge la liste initiale
        fetchOrders();

        // 2. On se connecte au Socket
        const socket = new SockJS('http://localhost:8081/ws');
        const client = Stomp.over(socket);

        // Désactiver les logs de debug dans la console (optionnel)
        client.debug = () => {};

        client.connect({}, () => {
            console.log("✅ Connecté au WebSocket !");

            // 3. On s'abonne au canal /topic/orders
            client.subscribe('/topic/orders', (message) => {
                const updatedOrder: Order = JSON.parse(message.body);
                console.log("🔥 Notification Reçue :", updatedOrder);

                // 4. Mise à jour intelligente du State (Sans recharger toute la liste)
                setOrders((prevOrders) => {
                    // Si la commande existe déjà, on la remplace
                    const exists = prevOrders.find(o => o.id === updatedOrder.id);
                    if (exists) {
                        return prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                    } else {
                        // Sinon, on l'ajoute
                        return [...prevOrders, updatedOrder];
                    }
                });
            });
        }, (error) => {
            console.error("❌ Erreur WebSocket :", error);
        });

        // Nettoyage à la fermeture du composant
        return () => {
            if (client && client.connected) {
                client.disconnect(() => console.log("Déconnecté"));
            }
        };
    }, []);

    // --- LOGIQUE ROUTING (Identique à avant) ---
    const zone0Orders = orders.filter(o => o.zoneId === 0).sort((a, b) => (a.deliveryIndex || 0) - (b.deliveryIndex || 0));
    const zone1Orders = orders.filter(o => o.zoneId === 1).sort((a, b) => (a.deliveryIndex || 0) - (b.deliveryIndex || 0));
    const routeZone0 = zone0Orders.map(o => [o.latitude, o.longitude] as [number, number]);
    const routeZone1 = zone1Orders.map(o => [o.latitude, o.longitude] as [number, number]);

    return (
        <MapContainer center={[33.5731, -7.5898]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            
            <Polyline positions={routeZone0} color="blue" weight={4} opacity={0.7} dashArray="10, 10" />
            <Polyline positions={routeZone1} color="red" weight={4} opacity={0.7} dashArray="10, 10" />

            {orders.map((order) => (
                <Marker key={order.id} position={[order.latitude, order.longitude]} icon={order.zoneId === 1 ? iconRed : iconBlue}>
                    <Popup>
                        <div className="text-center">
                            <h3 className="font-bold text-lg">{order.customerName}</h3>
                            <div className="text-sm text-gray-600 mb-2">
                                {order.zoneId !== undefined ? 
                                    <span className={`px-2 py-1 rounded text-white ${order.zoneId === 1 ? 'bg-red-500' : 'bg-blue-500'}`}>Zone {order.zoneId}</span> 
                                    : <span className="bg-yellow-500 text-white px-2 py-1 rounded">Calcul...</span>
                                }
                            </div>
                            {order.deliveryIndex && (<p className="font-bold text-lg my-1">📦 Stop N° {order.deliveryIndex}</p>)}
                            {order.driverName && (<div className="mt-2 p-1 bg-gray-100 rounded text-xs border border-gray-200">🚚 Livré par : <strong>{order.driverName}</strong></div>)}
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