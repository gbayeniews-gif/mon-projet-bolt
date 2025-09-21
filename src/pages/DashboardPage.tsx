import { useNavigate } from 'react-router-dom';
import { Users, ShoppingBag, Euro, AlertTriangle, Plus, CreditCard, Ruler } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { DashboardCard } from '../components/DashboardCard';
import { StatCard } from '../components/StatCard';
import { dbService } from '../services/database';

export function Dashboard() {
  const navigate = useNavigate();

  // ✅ Mise à jour des cartes du tableau de bord
  const dashboardCards = [
    {
      title: "Clients",
      icon: Users,
      bgColor: "bg-green-600",
      onClick: () => navigate('/clients')
    },
    {
      title: "Mesures",
      icon: Ruler,
      bgColor: "bg-teal-500",
      onClick: () => navigate('/clients')
    },
    {
      title: "Commandes",
      icon: ShoppingBag,
      bgColor: "bg-red-500",
      onClick: () => navigate('/commandes')
    },
    {
      title: "Paiements",
      icon: CreditCard,
      bgColor: "bg-yellow-500",
      onClick: () => navigate('/commandes')
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pb-20 pt-16">
        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Statistiques rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Aperçu rapide</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Clients"
                value="0"
                icon={Users}
                color="text-green-600"
              />
              <StatCard
                title="Commandes"
                value="0"
                icon={ShoppingBag}
                color="text-red-500"
              />
              <StatCard
                title="CA du mois"
                value="0 €"
                icon={Euro}
                color="text-blue-600"
              />
              <StatCard
                title="En attente"
                value="0"
                icon={AlertTriangle}
                color="text-yellow-500"
              />
            </div>
          </div>

          {/* Opérations principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Gestion principale</h3>
            <div className="grid grid-cols-2 gap-4">
              {dashboardCards.map((card, index) => (
                <DashboardCard
                  key={index}
                  title={card.title}
                  icon={card.icon}
                  bgColor={card.bgColor}
                  onClick={card.onClick}
                />
              ))}
            </div>
          </div>

          {/* Actions rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/clients/nouveau')}
                className="w-full bg-green-600 text-white p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
                <span>Nouveau client</span>
              </button>
              
              <button
                onClick={() => navigate('/commandes/nouvelle')}
                className="w-full bg-red-500 text-white p-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors"
              >
                <Plus size={20} />
                <span>Nouvelle commande</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}