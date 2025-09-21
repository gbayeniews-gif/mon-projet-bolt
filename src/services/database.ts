@@ .. @@
   async updateClient(id: string, updates: Partial<Client>): Promise<void> {
     await db.clients.update(id, updates);
   },
 
   async deleteClient(id: string): Promise<void> {
     await db.clients.delete(id);
   },
 
   // Mesures
   async createMesures(mesures: Omit<Mesures, 'id'>): Promise<Mesures> {
     const newMesures: Mesures = {
       ...mesures,
       id: crypto.randomUUID()
     };
     await db.mesures.add(newMesures);
     return newMesures;
   },
 
   async getMesuresByClient(clientId: string): Promise<Mesures[]> {
-    return await db.mesures.where('clientId').equals(clientId).toArray();
+    return await db.mesures.where('clientId').equals(clientId).reverse().sortBy('date');
   },
 
   async getMesures(id: string): Promise<Mesures | undefined> {
     return await db.mesures.get(id);
   },
+
+  async updateMesures(id: string, updates: Partial<Mesures>): Promise<void> {
+    await db.mesures.update(id, updates);
+  },
 
   // Commandes
   async createCommande(commande: Omit<Commande, 'id'>): Promise<Commande> {
     const newCommande: Commande = {
       ...commande,
       id: crypto.randomUUID()
     };
     await db.commandes.add(newCommande);
     return newCommande;
   },
 
   async getAllCommandes(): Promise<Commande[]> {
     return await db.commandes.orderBy('dateCommande').reverse().toArray();
   },
 
   async getCommandesByClient(clientId: string): Promise<Commande[]> {
     return await db.commandes.where('clientId').equals(clientId).toArray();
   },
+
+  async getCommande(id: string): Promise<Commande | undefined> {
+    return await db.commandes.get(id);
+  },
 
   async updateCommande(id: string, updates: Partial<Commande>): Promise<void> {
     await db.commandes.update(id, updates);
   },
 
   // Paiements
   async createPaiement(paiement: Omit<Paiement, 'id'>): Promise<Paiement> {
     const newPaiement: Paiement = {
       ...paiement,
       id: crypto.randomUUID()
     };
     await db.paiements.add(newPaiement);
     return newPaiement;
   },
 
   async getPaiementsByCommande(commandeId: string): Promise<Paiement[]> {
     return await db.paiements.where('commandeId').equals(commandeId).toArray();
   },
 
   // Retouches
   async createRetouche(retouche: Omit<Retouche, 'id' | 'createdAt'>): Promise<Retouche> {
     const newRetouche: Retouche = {
       ...retouche,
       id: crypto.randomUUID(),
       createdAt: new Date()
     };
     await db.retouches.add(newRetouche);
     return newRetouche;
   },
 
   async getAllRetouches(): Promise<Retouche[]> {
     return await db.retouches.orderBy('createdAt').reverse().toArray();
   },
+
+  async getRetouchesByCommande(commandeId: string): Promise<Retouche[]> {
+    return await db.retouches.where('commandeId').equals(commandeId).toArray();
+  },
 
   async updateRetouche(id: string, updates: Partial<Retouche>): Promise<void> {
     await db.retouches.update(id, updates);
   },