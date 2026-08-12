# 🇨🇲 API de Paiement Mesomb — Cameroun

API REST permettant d'intégrer des paiements **Mobile Money au Cameroun** grâce à **Mesomb**.

Cette API a été conçue pour simplifier l'intégration des paiements dans une application web ou mobile et fournir une interface unique pour initier, suivre et vérifier les transactions.

---

## 🚀 Fonctionnalités

* 🇨🇲 Paiements Mobile Money au Cameroun
* 💳 Intégration avec Mesomb
* 📱 Support des opérateurs compatibles avec Mesomb
* 🔐 Gestion sécurisée des clés API
* 🔄 Initialisation des transactions
* 🔎 Vérification du statut des transactions
* 📊 Retour des informations de paiement au format JSON
* ❌ Gestion des erreurs et des opérateurs non supportés
* 🌐 API REST facilement intégrable dans un frontend
* 🛡️ Variables d'environnement pour protéger les informations sensibles

---

# 🏗️ Architecture du projet

```text
mesomb-payment-api/
│
├── src/
│   ├── controllers/
│   │   └── paymentController.js
│   │
│   ├── routes/
│   │   └── paymentRoutes.js
│   │
│   ├── services/
│   │   └── mesombService.js
│   │
│   ├── config/
│   │   └── mesomb.js
│   │
│   └── app.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

> L'organisation exacte peut varier selon la structure du projet.

---

# ⚙️ Technologies utilisées

* **Node.js**
* **Express.js**
* **JavaScript**
* **Mesomb API**
* **REST API**
* **JSON**
* **dotenv**
* **Git / GitHub**

---

# 📋 Prérequis

Avant de lancer le projet, vous devez avoir installé :

* Node.js
* npm
* Git
* Un compte Mesomb
* Les identifiants/API credentials nécessaires pour utiliser Mesomb

Vérifier Node.js :

```bash
node --version
```

Vérifier npm :

```bash
npm --version
```

---

# 📥 Installation

Cloner le repository :

```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPOSITORY.git
```

Entrer dans le dossier :

```bash
cd VOTRE_REPOSITORY
```

Installer les dépendances :

```bash
npm install
```

---

# 🔐 Configuration

Créer un fichier `.env` à la racine du projet :

```env
PORT=5000

MESOMB_APPLICATION_KEY=your_application_key
MESOMB_ACCESS_KEY=your_access_key
MESOMB_SECRET_KEY=your_secret_key
```

⚠️ **Ne partagez jamais vos clés Mesomb publiquement.**

Le fichier `.env` doit être ajouté au `.gitignore` :

```gitignore
node_modules/
.env
.env.local
```

---

# ▶️ Démarrer l'API

Pour lancer le serveur en développement :

```bash
npm run dev
```

Ou, selon la configuration du projet :

```bash
npm start
```

Le serveur sera disponible sur :

```text
http://localhost:5000
```

---

# 💳 Paiement

L'API permet d'initier une transaction de paiement en envoyant les informations nécessaires au serveur.

Exemple de requête :

```http
POST /api/payment
Content-Type: application/json
```

Exemple de données :

```json
{
  "amount": 5000,
  "service": "Paiement",
  "customer": "237XXXXXXXXX",
  "currency": "XAF"
}
```

Le serveur valide les données reçues puis transmet la demande à Mesomb.

---

# 📱 Numéro camerounais

Pour les paiements au Cameroun, les numéros doivent être transmis dans un format compatible avec l'intégration utilisée.

Exemple :

```text
237XXXXXXXXX
```

Selon la configuration de votre intégration, le numéro peut nécessiter le préfixe international `237`.

Il est recommandé de normaliser les numéros avant de les envoyer au service de paiement.

---

# 🔄 Exemple de réponse

Lorsque le paiement est correctement initié, l'API peut retourner une réponse similaire à :

```json
{
  "success": true,
  "message": "Paiement initié avec succès",
  "transaction": {
    "id": "transaction_id",
    "status": "PENDING"
  }
}
```

En cas d'erreur :

```json
{
  "success": false,
  "message": "Impossible d'initier le paiement."
}
```

---

# 🔎 Statut d'une transaction

L'application peut également vérifier l'état d'une transaction.

Exemple :

```http
GET /api/payment/:transactionId
```

Réponse possible :

```json
{
  "success": true,
  "transaction": {
    "id": "transaction_id",
    "status": "SUCCESS"
  }
}
```

Les différents statuts peuvent notamment permettre de distinguer :

```text
PENDING
SUCCESS
FAILED
CANCELLED
```

---

# ❌ Gestion des erreurs

L'API retourne des réponses JSON permettant au frontend de comprendre le résultat de l'opération.

Exemple :

```json
{
  "success": false,
  "message": "Opérateur non supporté"
}
```

Autre exemple :

```json
{
  "success": false,
  "message": "Certains paramètres sont invalides"
}
```

Une erreur provenant de Mesomb peut également être retournée ou journalisée côté serveur afin de faciliter le diagnostic.

---

# 🧪 Tester l'API

Vous pouvez utiliser :

* Postman
* Insomnia
* Thunder Client
* cURL
* Votre frontend

### Exemple avec cURL

```bash
curl -X POST http://localhost:5000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "customer": "237XXXXXXXXX",
    "currency": "XAF"
  }'
```

---

# 🖥️ Utilisation depuis un frontend

Exemple JavaScript :

```javascript
const response = await fetch("http://localhost:5000/api/payment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    amount: 5000,
    customer: "237XXXXXXXXX",
    currency: "XAF"
  })
});

const data = await response.json();

console.log(data);
```

---

# 🔒 Sécurité

Les informations sensibles ne doivent jamais être stockées directement dans le code source.

❌ Mauvais :

```javascript
const secretKey = "ma-cle-secrete";
```

✅ Correct :

```javascript
const secretKey = process.env.MESOMB_SECRET_KEY;
```

Et dans `.env` :

```env
MESOMB_SECRET_KEY=xxxxxxxx
```

Le fichier `.env` doit rester local et ne doit jamais être envoyé sur GitHub.

---

# 🧾 Logs

Pendant le développement, l'API peut afficher les informations nécessaires au diagnostic des transactions.

Exemple :

```text
Server running on port 5000

NOUVEAU PAIEMENT

REQUETE MESOMB

REPONSE MESOMB
```

⚠️ En production, évitez d'afficher les clés secrètes, tokens ou informations sensibles des utilisateurs dans les logs.

---

# 🌍 Variables d'environnement

| Variable                 | Description            |
| ------------------------ | ---------------------- |
| `PORT`                   | Port du serveur        |
| `MESOMB_APPLICATION_KEY` | Clé application Mesomb |
| `MESOMB_ACCESS_KEY`      | Clé d'accès Mesomb     |
| `MESOMB_SECRET_KEY`      | Clé secrète Mesomb     |

---

# 📦 Scripts npm

Exemples de commandes disponibles :

```bash
npm start
```

Démarre l'API.

```bash
npm run dev
```

Démarre l'API en mode développement avec rechargement automatique si configuré.

---

# 🚀 Déploiement

L'API peut être déployée sur différents services cloud compatibles avec Node.js.

Avant le déploiement :

1. Configurer les variables d'environnement.
2. Ne pas envoyer `.env`.
3. Vérifier les URLs utilisées par le frontend.
4. Vérifier les règles CORS.
5. Tester les paiements en environnement approprié.
6. Vérifier les logs du serveur.
7. Vérifier les statuts des transactions.

---

# 🔐 GitHub

Avant de pousser le projet vers GitHub, vérifiez que `.gitignore` contient :

```gitignore
node_modules/
.env
.env.local
.env.*.local
```

Puis :

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

---

# 📚 Documentation

Pour comprendre le fonctionnement de Mesomb et les paramètres disponibles, consultez la documentation officielle de Mesomb.

---

# ⚠️ Important

Cette API agit comme une couche intermédiaire entre votre application et le fournisseur de paiement.

Ne faites jamais confiance uniquement aux données envoyées par le frontend.

Pour confirmer définitivement un paiement, votre backend doit vérifier le statut réel de la transaction auprès du fournisseur de paiement.

Ne considérez pas une simple réponse du frontend comme une preuve de paiement.

---

# 🛠️ Améliorations futures

Les évolutions possibles du projet comprennent :

* [ ] Webhooks de paiement
* [ ] Vérification automatique des transactions
* [ ] Historique des paiements
* [ ] Système de remboursement
* [ ] Dashboard administrateur
* [ ] Authentification JWT
* [ ] Rate limiting
* [ ] Validation avancée des numéros
* [ ] Normalisation automatique des numéros camerounais
* [ ] Notifications de paiement
* [ ] Base de données des transactions
* [ ] Système de logs avancé
* [ ] Documentation Swagger / OpenAPI
* [ ] Tests automatisés

---

# 👨‍💻 Auteur

Projet développé pour faciliter l'intégration des paiements Mobile Money au Cameroun.

---

# 📄 Licence

Ce projet est destiné à être utilisé conformément aux conditions d'utilisation et aux licences des services et bibliothèques utilisés.

---

## ⭐ Contribution

Les contributions, suggestions et améliorations sont les bienvenues.

Pour contribuer :

```bash
git clone https://github.com/VOTRE_USERNAME/VOTRE_REPOSITORY.git

cd VOTRE_REPOSITORY

git checkout -b feature/ma-fonctionnalite

git add .

git commit -m "Ajout d'une nouvelle fonctionnalité"

git push origin feature/ma-fonctionnalite
```

Puis ouvrez une **Pull Request** sur GitHub.
