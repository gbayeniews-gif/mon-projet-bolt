import { useNavigate } from 'react-router-dom';
import { Users, ShoppingBag, Euro, AlertTriangle, Plus, CreditCard, Ruler } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { DashboardCard } from '../components/DashboardCard';
import { StatCard } from '../components/StatCard';
import { dbService } from '../services/database';

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