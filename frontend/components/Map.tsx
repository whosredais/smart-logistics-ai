'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

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

// Interface partagée
export interface Order {
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

// Le composant reçoit les commandes depuis le parent (Page)
const MapComponent = ({ orders }: { orders: Order[] }) => {
    
    // LOGIQUE ROUTING
    const zone0Orders = orders.filter(o => o.zoneId === 0).sort((a, b) => (a.deliveryIndex || 0) - (b.deliveryIndex || 0));
    const zone1Orders = orders.filter(o => o.zoneId === 1).sort((a, b) => (a.deliveryIndex || 0) - (b.deliveryIndex || 0));
    const routeZone0 = zone0Orders.map(o => [o.latitude, o.longitude] as [number, number]);
    const routeZone1 = zone1Orders.map(o => [o.latitude, o.longitude] as [number, number]);

    return (
        <MapContainer center={[33.5731, -7.5898]} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '10px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            
            <Polyline positions={routeZone0} color="blue" weight={4} opacity={0.7} dashArray="10, 10" />
            <Polyline positions={routeZone1} color="red" weight={4} opacity={0.7} dashArray="10, 10" />

            {orders.map((order) => (
                <Marker key={order.id} position={[order.latitude, order.longitude]} icon={order.zoneId === 1 ? iconRed : iconBlue}>
                    <Popup>
                        <div className="text-center min-w-[150px]">
                            <h3 className="font-bold text-lg text-gray-800">{order.customerName}</h3>
                            <div className="text-sm mb-2">
                                {order.zoneId !== undefined ? 
                                    <span className={`px-2 py-1 rounded text-white text-xs ${order.zoneId === 1 ? 'bg-red-500' : 'bg-blue-500'}`}>Zone {order.zoneId}</span> 
                                    : <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs animate-pulse">Calcul IA...</span>
                                }
                            </div>
                            {order.deliveryIndex && (<p className="font-bold text-md text-gray-700 my-1">📦 Stop N° {order.deliveryIndex}</p>)}
                            {order.driverName && (<div className="mt-2 p-2 bg-green-50 rounded text-xs border border-green-200 text-green-700 font-bold">🚚 {order.driverName}</div>)}
                            <hr className="my-2 border-gray-200"/>
                            <p className="text-gray-600">{order.price} MAD</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;