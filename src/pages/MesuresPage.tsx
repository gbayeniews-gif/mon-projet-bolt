import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ruler, Plus, Edit, Calendar, MessageSquare } from 'lucide-react';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { dbService } from '../services/database';
import { Client, Mesures } from '../types';

export const MesuresPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [mesures, setMesures] = useState<Mesures[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMesure, setEditingMesure] = useState<Mesures | null>(null);
  const [formData, setFormData] = useState({
    dos: '',
    longueurManche: '',
    tourManche: '',
    longueurRobe: '',
    longueurJupe: '',
    longueurPantalon: '',
    longueurTaille: '',
    hauteurPoitrine: '',
    hauteurSousSein: '',
    encolure: '',
    carrure: '',
    tourPoitrine: '',
    tourSousSein: '',
    tourTaille: '',
    tourBassin: '',
    hauteurBassin: '',
    ceinture: '',
    basPantalon: '',
    tourGenou: '',
    commentaire: ''
  });

  useEffect(() => {
    if (clientId) {
      loadData();
    }
  }, [clientId]);

  const loadData = async () => {
    if (!clientId) return;

    try {
      const [clientData, mesuresData] = await Promise.all([
        dbService.getClient(clientId),
        dbService.getMesuresByClient(clientId)
      ]);

      setClient(clientData || null);
      setMesures(mesuresData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      dos: '',
      longueurManche: '',
      tourManche: '',
      longueurRobe: '',
      longueurJupe: '',
      longueurPantalon: '',
      longueurTaille: '',
      hauteurPoitrine: '',
      hauteurSousSein: '',
      encolure: '',
      carrure: '',
      tourPoitrine: '',
      tourSousSein: '',
      tourTaille: '',
      tourBassin: '',
      hauteurBassin: '',
      ceinture: '',
      basPantalon: '',
      tourGenou: '',
      commentaire: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    try {
      const mesureData = {
        clientId,
        dos: parseFloat(formData.dos) || 0,
        longueurManche: parseFloat(formData.longueurManche) || 0,
        tourManche: parseFloat(formData.tourManche) || 0,
        longueurRobe: parseFloat(formData.longueurRobe) || 0,
        longueurJupe: parseFloat(formData.longueurJupe) || 0,
        longueurPantalon: parseFloat(formData.longueurPantalon) || 0,
        longueurTaille: parseFloat(formData.longueurTaille) || 0,
        hauteurPoitrine: parseFloat(formData.hauteurPoitrine) || 0,
        hauteurSousSein: parseFloat(formData.hauteurSousSein) || 0,
        encolure: parseFloat(formData.encolure) || 0,
        carrure: parseFloat(formData.carrure) || 0,
        tourPoitrine: parseFloat(formData.tourPoitrine) || 0,
        tourSousSein: parseFloat(formData.tourSousSein) || 0,
        tourTaille: parseFloat(formData.tourTaille) || 0,
        tourBassin: parseFloat(formData.tourBassin) || 0,
        hauteurBassin: parseFloat(formData.hauteurBassin) || 0,
        ceinture: parseFloat(formData.ceinture) || 0,
        basPantalon: parseFloat(formData.basPantalon) || 0,
        tourGenou: parseFloat(formData.tourGenou) || 0,
        commentaire: formData.commentaire,
        date: new Date()
      };

      if (editingMesure) {
        await dbService.updateMesures(editingMesure.id, mesureData);
      } else {
        await dbService.createMesures(mesureData);
      }

      setShowAddModal(false);
      setEditingMesure(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving mesures:', error);
    }
  };

  const handleEdit = (mesure: Mesures) => {
    setEditingMesure(mesure);
    setFormData({
      dos: mesure.dos.toString(),
      longueurManche: mesure.longueurManche.toString(),
      tourManche: mesure.tourManche.toString(),
      longueurRobe: mesure.longueurRobe.toString(),
      longueurJupe: mesure.longueurJupe.toString(),
      longueurPantalon: mesure.longueurPantalon.toString(),
      longueurTaille: mesure.longueurTaille.toString(),
      hauteurPoitrine: mesure.hauteurPoitrine.toString(),
      hauteurSousSein: mesure.hauteurSousSein.toString(),
      encolure: mesure.encolure.toString(),
      carrure: mesure.carrure.toString(),
      tourPoitrine: mesure.tourPoitrine.toString(),
      tourSousSein: mesure.tourSousSein.toString(),
      tourTaille: mesure.tourTaille.toString(),
      tourBassin: mesure.tourBassin.toString(),
      hauteurBassin: mesure.hauteurBassin.toString(),
      ceinture: mesure.ceinture.toString(),
      basPantalon: mesure.basPantalon.toString(),
      tourGenou: mesure.tourGenou.toString(),
      commentaire: mesure.commentaire || ''
    });
    setShowAddModal(true);
  };

  const mesureFields = [
    { key: 'dos', label: 'Dos (cm)', type: 'number' },
    { key: 'longueurManche', label: 'Longueur manche (cm)', type: 'number' },
    { key: 'tourManche', label: 'Tour manche (cm)', type: 'number' },
    { key: 'longueurRobe', label: 'Longueur robe (cm)', type: 'number' },
    { key: 'longueurJupe', label: 'Longueur jupe (cm)', type: 'number' },
    { key: 'longueurPantalon', label: 'Longueur pantalon (cm)', type: 'number' },
    { key: 'longueurTaille', label: 'Longueur taille (cm)', type: 'number' },
    { key: 'hauteurPoitrine', label: 'Hauteur poitrine (cm)', type: 'number' },
    { key: 'hauteurSousSein', label: 'Hauteur sous-sein (cm)', type: 'number' },
    { key: 'encolure', label: 'Encolure (cm)', type: 'number' },
    { key: 'carrure', label: 'Carrure (cm)', type: 'number' },
    { key: 'tourPoitrine', label: 'Tour poitrine (cm)', type: 'number' },
    { key: 'tourSousSein', label: 'Tour sous-sein (cm)', type: 'number' },
    { key: 'tourTaille', label: 'Tour taille (cm)', type: 'number' },
    { key: 'tourBassin', label: 'Tour bassin (cm)', type: 'number' },
    { key: 'hauteurBassin', label: 'Hauteur bassin (cm)', type: 'number' },
    { key: 'ceinture', label: 'Ceinture (cm)', type: 'number' },
    { key: 'basPantalon', label: 'Bas pantalon (cm)', type: 'number' },
    { key: 'tourGenou', label: 'Tour genou (cm)', type: 'number' }
  ];

  if (!client) {
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
      <Header title={`Mesures - ${client.nom} ${client.prenoms}`} showBack />

      <div className="p-4 space-y-6">
        {/* Add Button */}
        <button
          onClick={() => {
            resetForm();
            setEditingMesure(null);
            setShowAddModal(true);
          }}
          className="w-full bg-[#1B7F4D] text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#155A3A] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter des mesures</span>
        </button>

        {/* Mesures List */}
        <div className="space-y-4">
          {mesures.length > 0 ? (
            mesures.map((mesure) => (
              <div key={mesure.id} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-[#1B7F4D]" />
                    <span className="font-semibold">
                      {new Date(mesure.date).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEdit(mesure)}
                    className="text-[#1B7F4D] hover:text-[#155A3A] transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <span className="text-gray-600">Tour poitrine:</span>
                    <span className="font-medium ml-2">{mesure.tourPoitrine}cm</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-600">Tour taille:</span>
                    <span className="font-medium ml-2">{mesure.tourTaille}cm</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-600">Tour bassin:</span>
                    <span className="font-medium ml-2">{mesure.tourBassin}cm</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-600">Longueur robe:</span>
                    <span className="font-medium ml-2">{mesure.longueurRobe}cm</span>
                  </div>
                </div>

                {mesure.commentaire && (
                  <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{mesure.commentaire}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Ruler className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mesure</h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter les premières mesures de ce client
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setEditingMesure(null);
                  setShowAddModal(true);
                }}
                className="bg-[#1B7F4D] text-white px-6 py-2 rounded-lg hover:bg-[#155A3A] transition-colors"
              >
                Ajouter des mesures
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingMesure(null);
          resetForm();
        }}
        title={editingMesure ? 'Modifier les mesures' : 'Ajouter des mesures'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mesureFields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                type={field.type}
                value={formData[field.key as keyof typeof formData]}
                onChange={(value) => setFormData(prev => ({ ...prev, [field.key]: value }))}
                placeholder="0"
              />
            ))}
          </div>

          <FormField
            label="Commentaire"
            value={formData.commentaire}
            onChange={(value) => setFormData(prev => ({ ...prev, commentaire: value }))}
            placeholder="Notes ou observations particulières..."
            rows={3}
          />

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingMesure(null);
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
              {editingMesure ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      <BottomNavigation />
    </div>
  );
};