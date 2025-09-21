import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Plus, Filter, Calendar, Euro, User } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { dbService } from '../services/database';
import { Commande, Client, Mesures } from '../types';

export const CommandesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<Commande[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState<string>('');
  const [formData, setFormData] = useState({
    clientId: '',
    modele: '',
    dateLivraisonPrevue: '',
    montantTotal: '',
    acompte: '',
    photo: ''
  });

  const statuts = ['En attente', 'En cours', 'Retouche', 'Livrée'];

  useEffect(() => {
    loadData();
    
    // Check if we should open the add modal with a pre-selected client
    const clientId = searchParams.get('clientId');
    if (clientId) {
      setFormData(prev => ({ ...prev, clientId }));
      setShowAddModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    filterCommandes();
  }, [commandes, selectedStatut]);

  const loadData = async () => {
    try {
      const [commandesData, clientsData] = await Promise.all([
        dbService.getAllCommandes(),
        dbService.getAllClients()
      ]);

      setCommandes(commandesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterCommandes = () => {
    if (selectedStatut) {
      setFilteredCommandes(commandes.filter(c => c.statut === selectedStatut));
    } else {
      setFilteredCommandes(commandes);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.modele || !formData.dateLivraisonPrevue || !formData.montantTotal) {
      return;
    }

    try {
      // Get the latest mesures for the client
      const mesures = await dbService.getMesuresByClient(formData.clientId);
      const latestMesures = mesures.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

      if (!latestMesures) {
        alert('Ce client n\'a pas de mesures enregistrées. Veuillez d\'abord ajouter des mesures.');
        return;
      }

      const montantTotal = parseFloat(formData.montantTotal);
      const acompte = parseFloat(formData.acompte) || 0;

      const commandeData = {
        clientId: formData.clientId,
        mesuresId: latestMesures.id,
        modele: formData.modele,
        photo: formData.photo || undefined,
        dateCommande: new Date(),
        dateLivraisonPrevue: new Date(formData.dateLivraisonPrevue),
        statut: 'En attente' as const,
        montantTotal,
        acompte,
        reste: montantTotal - acompte,
        statutPaiement: acompte >= montantTotal ? 'Complet' : acompte > 0 ? 'Partiel' : 'En attente' as const
      };

      await dbService.createCommande(commandeData);

      // Create payment record if there's an acompte
      if (acompte > 0) {
        await dbService.createPaiement({
          commandeId: '', // Will be set by the database service
          montant: acompte,
          type: 'Acompte',
          date: new Date()
        });
      }

      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating commande:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      modele: '',
      dateLivraisonPrevue: '',
      montantTotal: '',
      acompte: '',
      photo: ''
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return 'bg-gray-100 text-gray-800';
      case 'En cours':
        return 'bg-blue-100 text-blue-800';
      case 'Retouche':
        return 'bg-yellow-100 text-yellow-800';
      case 'Livrée':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.nom} ${client.prenoms}` : 'Client inconnu';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Commandes" showBack />

      <div className="p-4 space-y-6">
        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex-1 bg-[#1B7F4D] text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#155A3A] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle commande</span>
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Filter className="w-5 h-5 text-[#1B7F4D]" />
            <span className="font-medium">Filtrer par statut</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatut('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedStatut === '' 
                  ? 'bg-[#1B7F4D] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            {statuts.map((statut) => (
              <button
                key={statut}
                onClick={() => setSelectedStatut(statut)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedStatut === statut 
                    ? 'bg-[#1B7F4D] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statut}
              </button>
            ))}
          </div>
        </div>

        {/* Commandes List */}
        <div className="space-y-3">
          {filteredCommandes.length > 0 ? (
            filteredCommandes.map((commande) => (
              <div
                key={commande.id}
                onClick={() => navigate(`/commandes/${commande.id}`)}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{commande.modele}</h3>
                    <div className="flex items-center text-sm text-gray-600 space-x-1">
                      <User className="w-4 h-4" />
                      <span>{getClientName(commande.clientId)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(commande.statut)}`}>
                    {commande.statut}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Livraison: {new Date(commande.dateLivraisonPrevue).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Euro className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {commande.montantTotal}€ ({commande.statutPaiement})
                    </span>
                  </div>
                </div>

                {commande.reste > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-red-600 font-medium">
                      Reste à payer: {commande.reste}€
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedStatut ? `Aucune commande "${selectedStatut}"` : 'Aucune commande'}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedStatut 
                  ? 'Aucune commande ne correspond à ce statut'
                  : 'Commencez par créer votre première commande'
                }
              </p>
              {!selectedStatut && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="bg-[#1B7F4D] text-white px-6 py-2 rounded-lg hover:bg-[#155A3A] transition-colors"
                >
                  Créer une commande
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Nouvelle commande"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B7F4D] focus:border-transparent"
            >
              <option value="">Sélectionner un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nom} {client.prenoms}
                </option>
              ))}
            </select>
          </div>

          <FormField
            label="Modèle"
            value={formData.modele}
            onChange={(value) => setFormData(prev => ({ ...prev, modele: value }))}
            placeholder="Nom du modèle ou description"
            required
          />

          <FormField
            label="Date de livraison prévue"
            type="date"
            value={formData.dateLivraisonPrevue}
            onChange={(value) => setFormData(prev => ({ ...prev, dateLivraisonPrevue: value }))}
            required
          />

          <FormField
            label="Montant total (€)"
            type="number"
            value={formData.montantTotal}
            onChange={(value) => setFormData(prev => ({ ...prev, montantTotal: value }))}
            placeholder="0"
            required
          />

          <FormField
            label="Acompte (€)"
            type="number"
            value={formData.acompte}
            onChange={(value) => setFormData(prev => ({ ...prev, acompte: value }))}
            placeholder="0"
          />

          <FormField
            label="Photo/Référence"
            value={formData.photo}
            onChange={(value) => setFormData(prev => ({ ...prev, photo: value }))}
            placeholder="URL de l'image ou référence"
          />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#1B7F4D] text-white py-2 rounded-lg hover:bg-[#155A3A] transition-colors"
            >
              Créer
            </button>
          </div>
        </form>
      </Modal>

      <BottomNavigation />
    </div>
  );
};