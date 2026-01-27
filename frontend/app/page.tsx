'use client' // Ajoute ceci tout en haut si Next.js te crie dessus

import dynamic from 'next/dynamic';

// L'import reste le même car @ pointe vers la racine
const MapWithNoSSR = dynamic(() => import('@/components/Map'), { 
    ssr: false,
    loading: () => <p className="p-4">Chargement de la carte...</p>
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-blue-900 text-white p-4 shadow-md z-10">
        <h1 className="text-2xl font-bold">🚛 Smart Logistics Dashboard</h1>
        <p className="text-sm opacity-80">Suivi temps réel & Optimisation IA</p>
      </header>
      
      <div className="flex-grow relative h-screen w-full">
        <MapWithNoSSR />
      </div>
    </main>
  );
}