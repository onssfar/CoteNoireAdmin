# Côte Noire — Administration

Admin React/Vite pour la gestion des commandes, produits, clients et statistiques.

## Lancer

```bash
npm install
npm run dev
```

Par défaut, Vite utilise le proxy `/api` vers `http://localhost:8086`.
Pour un autre backend, définir `VITE_API_URL`.

## Fonctionnalités ajoutées

- Nom/prénom du client dans la liste des commandes lorsque l'API les fournit.
- Recherche par nom, prénom, email ou téléphone.
- Détail commande + fiche client.
- Facture ergonomique avec bouton d'impression.
- Processus de livraison : Non traitée → Confirmée → Préparation → Expédiée → Livrée.
- Statuts visuels avec couleurs distinctes.
- Logo Côte Noire intégré.
- Images produits présentées en `contain` pour conserver leurs proportions.
- Police et informations principales agrandies pour améliorer la lisibilité.

### Données client
L'interface accepte les réponses API contenant `customer`, `client`, `customerInfo`, ou les champs client à plat (`firstName`, `lastName`, `email`, etc.).

Si l'API ne renvoie pas les données client/articles, l'interface les signale comme non fournies au lieu de les inventer.
