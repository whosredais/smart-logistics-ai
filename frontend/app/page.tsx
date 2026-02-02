'use client'

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import type { Order } from '../components/Map.tsx'; // Assure-toi que l'import type fonctionne

// Import dynamique de la carte (pour éviter les erreurs SSR de Leaflet)
const MapComponent = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<{time: string, msg: string}[]>([]);

  // KPIs
  const totalRevenue = orders.reduce((acc, o) => acc + o.price, 0);
  const activeDrivers = new Set(orders.map(o => o.driverName).filter(Boolean)).size;

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg }, ...prev].slice(0, 10)); // Garde les 10 derniers logs
  };

  useEffect(() => {
    // 1. Chargement initial
    axios.get('http://localhost:8081/api/orders').then(res => {
        setOrders(res.data);
        addLog(`📦 Chargement initial : ${res.data.length} commandes.`);
    }).catch(err => console.error(err));

    // 2. Connexion WebSocket
    const socket = new SockJS('http://localhost:8081/ws');
    const client = Stomp.over(socket);
    client.debug = () => {}; // Désactiver logs debug

    client.connect({}, () => {
        addLog("✅ Système connecté au WebSocket (Temps réel)");
        
        client.subscribe('/topic/orders', (message) => {
            const updatedOrder: Order = JSON.parse(message.body);
            
            setOrders((prev) => {
                const exists = prev.find(o => o.id === updatedOrder.id);
                // Log intelligent
                if (!exists) addLog(`🆕 Nouvelle commande : ${updatedOrder.customerName}`);
                else if (updatedOrder.driverName && !exists.driverName) addLog(`🚚 Livreur assigné : ${updatedOrder.driverName} -> ${updatedOrder.customerName}`);
                
                if (exists) return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                return [...prev, updatedOrder];
            });
        });
    });

    return () => { if (client.connected) client.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
            <span className="text-2xl">🚛</span>
            <h1 className="text-xl font-bold tracking-wide">Smart Logistics <span className="text-blue-400">AI Dashboard</span></h1>
        </div>
        <div className="text-xs text-gray-400">v2.0 • WebSocket Active</div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-6 p-6 max-w-7xl mx-auto w-full">
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex flex-col">
            <span className="text-gray-500 text-sm uppercase font-semibold">Commandes Totales</span>
            <span className="text-3xl font-bold text-gray-800">{orders.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex flex-col">
            <span className="text-gray-500 text-sm uppercase font-semibold">Chiffre d'Affaires</span>
            <span className="text-3xl font-bold text-gray-800">{totalRevenue} <span className="text-sm font-normal text-gray-500">MAD</span></span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500 flex flex-col">
            <span className="text-gray-500 text-sm uppercase font-semibold">Livreurs Actifs</span>
            <span className="text-3xl font-bold text-gray-800">{activeDrivers}</span>
        </div>
      </div>

      {/* Main Content: Map & Logs */}
      <div className="flex-1 flex gap-6 px-6 pb-6 max-w-7xl mx-auto w-full h-[600px]">
        
        {/* Colonne Gauche : Carte (75%) */}
        <div className="w-3/4 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
            <MapComponent orders={orders} />
        </div>

        {/* Colonne Droite : Logs (25%) */}
        <div className="w-1/4 bg-slate-800 rounded-xl shadow-lg flex flex-col overflow-hidden">
            <div className="p-3 bg-slate-900 border-b border-slate-700 text-white font-semibold flex justify-between items-center">
                <span>Activités Live</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
                {logs.length === 0 && <p className="text-gray-500 text-center italic mt-10">En attente d'événements...</p>}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 text-gray-300 border-b border-slate-700 pb-2 last:border-0 animate-fadeIn">
                        <span className="text-blue-400 min-w-[50px]">{log.time}</span>
                        <span>{log.msg}</span>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}