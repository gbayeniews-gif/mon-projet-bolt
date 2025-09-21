import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Calendar, Euro, Edit, Plus, Scissors, CreditCard } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { dbService } from '../services/database';
import { Commande, Client, Mesures, Paiement, Retouche } from '../types';

export const CommandeDetailPage: React.FC = () => {
  const { commandeId } = useParams<{ commandeId: string }>();
  const navigate = useNavigate();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [mesures, setMesures] = useState<Mesures | null>(null);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [retouches, setRetouches] = useState<Retouche[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [showRetoucheModal, setShowRetoucheModal] = useState(false);
  const [editData, setEditData] = useState({
    statut: '',
    dateLivraisonPrevue: ''
  });
  const [paiementData, setPaiementData] = useState({
    montant: '',
    type: 'Solde' as 'Acompte' | 'Solde'
  });
  const [retoucheData, setRetoucheData] = useState({
    description: '',
    datePrevue: ''
  });

  const statuts = ['En attente', 'En cours', 'Retouche', 'Livrée'];

  useEffect(() => {
    if (commandeId) {
      loadData();
    }
  }, [commandeId]);

  const loadData = async () => {
    if (!commandeId) return;

    try {
      const commandeData = await dbService.getCommande(commandeId);
      if (!commandeData) return;

      const [clientData, mesuresData, paiementsData, retouchesData] = await Promise.all([
        dbService.getClient(commandeData.clientId),
        dbService.getMesures(commandeData.mesuresId),
        dbService.getPaiementsByCommande(commandeId),
        dbService.getRetouchesByCommande(commandeId)
      ]);

      setCommande(commandeData);
      setClient(clientData || null);
      setMesures(mesuresData || null);
      setPaiements(paiementsData);
      setRetouches(retouchesData);

      setEditData({
        statut: commandeData.statut,
        dateLivraisonPrevue: commandeData.dateLivraisonPrevue.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandeId) return;

    try {
      await dbService.updateCommande(commandeId, {
        statut: editData.statut as any,
        dateLivraisonPrevue: new Date(editData.dateLivraisonPrevue)
      });

      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error('Error updating commande:', error);
    }
  };

  const handlePaiementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandeId || !paiementData.montant) return;

    try {
      await dbService.createPaiement({
        commandeId,
        montant: parseFloat(paiementData.montant),
        type: paiementData.type,
        date: new Date()
      });

      // Update commande payment status
      if (commande) {
        const totalPaye = paiements.reduce((sum, p) => sum + p.montant, 0) + parseFloat(paiementData.montant);
        const nouveauReste = commande.montantTotal - totalPaye;
        const nouveauStatut = nouveauReste <= 0 ? 'Complet' : totalPaye > 0 ? 'Partiel' : 'En attente';

        await dbService.updateCommande(commandeId, {
          reste: nouveauReste,
          statutPaiement: nouveauStatut as any
        });
      }

      setShowPaiementModal(false);
      setPaiementData({ montant: '', type: 'Solde' });
      loadData();
    } catch (error) {
      console.error('Error creating paiement:', error);
    }
  };

  const handleRetoucheSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandeId || !retoucheData.description || !retoucheData.datePrevue) return;

    try {
      await dbService.createRetouche({
        commandeId,
        description: retoucheData.description,
        datePrevue: new Date(retoucheData.datePrevue),
        statut: 'En attente'
      });

      setShowRetoucheModal(false);
      setRetoucheData({ description: '', datePrevue: '' });
      loadData();
    } catch (error) {
      console.error('Error creating retouche:', error);
    }
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

  if (!commande || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B7F4D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Détail Commande" showBack />

      <div className="p-4 space-y-6">
        {/* Commande Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#1B7F4D] rounded-full flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{commande.modele}</h2>
                <p className="text-sm text-gray-500">
                  Commande du {new Date(commande.dateCommande).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-gray-400 hover:text-[#1B7F4D] transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className={`px-2 py-1 text-sm rounded-full ${getStatutColor(commande.statut)}`}>
                {commande.statut}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Client:</span>
              <span className="font-medium">{client.nom} {client.prenoms}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Livraison prévue:</span>
              <span className="font-medium">
                {new Date(commande.dateLivraisonPrevue).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Montant total:</span>
              <span className="font-bold text-lg">{commande.montantTotal}€</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Acompte versé:</span>
              <span className="font-medium text-green-600">{commande.acompte}€</span>
            </div>
            
            {commande.reste > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reste à payer:</span>
                <span className="font-bold text-red-600">{commande.reste}€</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowPaiementModal(true)}
            className="bg-green-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-green-700 transition-colors"
          >
            <CreditCard className="w-6 h-6" />
            <span className="text-sm font-medium">Paiement</span>
          </button>
          <button
            onClick={() => setShowRetoucheModal(true)}
            className="bg-yellow-600 text-white p-4 rounded-lg flex flex-col items-center space-y-2 hover:bg-yellow-700 transition-colors"
          >
            <Scissors className="w-6 h-6" />
            <span className="text-sm font-medium">Retouche</span>
          </button>
        </div>

        {/* Paiements */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Paiements ({paiements.length})</span>
            </h3>
          </div>
          <div className="p-4">
            {paiements.length > 0 ? (
              <div className="space-y-3">
                {paiements.map((paiement) => (
                  <div key={paiement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{paiement.type}</span>
                      <p className="text-sm text-gray-500">
                        {new Date(paiement.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-bold text-green-600">{paiement.montant}€</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucun paiement enregistré</p>
            )}
          </div>
        </div>

        {/* Retouches */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Scissors className="w-5 h-5" />
              <span>Retouches ({retouches.length})</span>
            </h3>
          </div>
          <div className="p-4">
            {retouches.length > 0 ? (
              <div className="space-y-3">
                {retouches.map((retouche) => (
                  <div key={retouche.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{retouche.description}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        retouche.statut === 'Terminée' ? 'bg-green-100 text-green-800' :
                        retouche.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {retouche.statut}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Prévue le {new Date(retouche.datePrevue).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune retouche</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier la commande"
      >
        <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={editData.statut}
              onChange={(e) => setEditData(prev => ({ ...prev, statut: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B7F4D] focus:border-transparent"
            >
              {statuts.map((statut) => (
                <option key={statut} value={statut}>{statut}</option>
              ))}
            </select>
          </div>

          <FormField
            label="Date de livraison prévue"
            type="date"
            value={editData.dateLivraisonPrevue}
            onChange={(value) => setEditData(prev => ({ ...prev, dateLivraisonPrevue: value }))}
            required
          />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#1B7F4D] text-white py-2 rounded-lg hover:bg-[#155A3A] transition-colors"
            >
              Modifier
            </button>
          </div>
        </form>
      </Modal>

      {/* Paiement Modal */}
      <Modal
        isOpen={showPaiementModal}
        onClose={() => setShowPaiementModal(false)}
        title="Nouveau paiement"
      >
        <form onSubmit={handlePaiementSubmit} className="p-4 space-y-4">
          <FormField
            label="Montant (€)"
            type="number"
            value={paiementData.montant}
            onChange={(value) => setPaiementData(prev => ({ ...prev, montant: value }))}
            placeholder="0"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={paiementData.type}
              onChange={(e) => setPaiementData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B7F4D] focus:border-transparent"
            >
              <option value="Acompte">Acompte</option>
              <option value="Solde">Solde</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPaiementModal(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* Retouche Modal */}
      <Modal
        isOpen={showRetoucheModal}
        onClose={() => setShowRetoucheModal(false)}
        title="Nouvelle retouche"
      >
        <form onSubmit={handleRetoucheSubmit} className="p-4 space-y-4">
          <FormField
            label="Description"
            value={retoucheData.description}
            onChange={(value) => setRetoucheData(prev => ({ ...prev, description: value }))}
            placeholder="Description de la retouche à effectuer"
            rows={3}
            required
          />

          <FormField
            label="Date prévue"
            type="date"
            value={retoucheData.datePrevue}
            onChange={(value) => setRetoucheData(prev => ({ ...prev, datePrevue: value }))}
            required
          />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowRetoucheModal(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </form>
      </Modal>

      <BottomNavigation />
    </div>
  );
};