# Mise en ligne de La Boutique du Geek

Ce dossier contient :
- `index.html` : le site (ton design d'origine, inchangé)
- `content/` : tes articles, catégories, pages et réglages (c'est ce que l'administration modifie)
- `admin/` : l'interface d'administration, accessible sur **boutiqgeek.fr/admin**
- `images/uploads/` : les photos que tu ajouteras

Tu n'auras plus jamais besoin de modifier `index.html` : tout se fait dans /admin.

---

## Étape 1 : GitHub (stockage gratuit des fichiers)

1. Crée un compte gratuit sur github.com.
2. Clique sur **New repository**. Nom : `boutiqgeek`. Laisse tout le reste par défaut, puis **Create repository**.
3. Ouvre le fichier `admin/config.yml` (dans ce dossier) et remplace `VOTRE_PSEUDO_GITHUB` par ton identifiant GitHub. Enregistre.
4. Sur la page du dépôt, clique sur **uploading an existing file** et glisse-dépose **tout le contenu** du dossier (`index.html`, et les dossiers `admin`, `content`, `images`). Clique sur **Commit changes**.

## Étape 2 : Netlify (hébergement gratuit)

1. Crée un compte sur netlify.com avec **Sign up with GitHub**.
2. **Add new site → Import an existing project → GitHub**, choisis `boutiqgeek`.
3. Laisse « Build command » vide et « Publish directory » vide (ou `/`), puis **Deploy**.
4. Au bout d'une minute, ton site est visible sur une adresse `xxxx.netlify.app`.

## Étape 3 : autoriser la connexion à /admin

L'administration doit pouvoir se connecter à GitHub en ton nom.

1. Sur GitHub : **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Application name : `Boutique du Geek admin`
   - Homepage URL : `https://boutiqgeek.fr`
   - Authorization callback URL : `https://api.netlify.com/auth/done`
2. Clique sur **Register application**, puis **Generate a new client secret**. Note le *Client ID* et le *Client secret*.
3. Sur Netlify : ton site → **Site configuration → Access & security → OAuth → Install provider → GitHub**, et colle le Client ID et le Client secret.

> Les noms des menus Netlify changent de temps en temps. Si tu ne retrouves pas un menu, dis-le-moi : je t'aide en direct.

## Étape 4 : brancher boutiqgeek.fr

1. Sur Netlify : **Domain management → Add a domain** → `boutiqgeek.fr`. Netlify t'affiche les valeurs DNS à utiliser (une adresse IP pour `boutiqgeek.fr` et une adresse en `.netlify.app` pour `www`).
2. Sur OVH, dans la **zone DNS** de boutiqgeek.fr :
   - supprime les anciens enregistrements **A** et **AAAA** du domaine nu, et le **CNAME** ou la redirection de `www` ;
   - ajoute un enregistrement **A** (domaine nu) avec l'IP donnée par Netlify ;
   - ajoute un **CNAME** `www` vers l'adresse `.netlify.app` donnée par Netlify.
3. **Ne touche pas** aux enregistrements **MX** (et TXT/SPF) : ils font fonctionner ta messagerie OVH.
4. Sur Netlify, active le HTTPS gratuit (**Domain management → HTTPS → Verify DNS / Provision certificate**). Compte quelques minutes à quelques heures.

## Utiliser l'administration

Va sur **boutiqgeek.fr/admin** → **Login with GitHub**. Tu y trouves :

| Rubrique | Ce que tu y fais |
|---|---|
| 🛒 Articles | Ajouter un article : titre, prix, catégorie, description, photo, liens Leboncoin / Vinted / eBay, case « vendu » |
| 🗂️ Catégories | Créer, renommer, réordonner les catégories (les boutons de filtre du site) |
| 📄 Pages | Créer une page de texte (ex. « À propos », « Livraison »). Elle apparaît comme un nouvel onglet dans le menu |
| ⚙️ Réglages du site | Nom, accroche, e-mail, liens de tes boutiques, texte de l'onglet Contact, bas de page |

Après avoir modifié quelque chose, clique sur **Publish → Publish now**. Le site se met à jour en 1 à 2 minutes.

Astuce : crée d'abord la catégorie dans « Catégories », puis choisis-la dans la liste en créant l'article.

## Tes 12 articles actuels

Les 12 articles de ton tableau « mes articles » sont déjà dans `content/articles.json`. Pour les 8 qui n'avaient pas de titre, il a été déduit du lien Vinted : relis-les et corrige si besoin depuis /admin. Aucun n'a encore de photo (une icône 🎮 s'affiche à la place). Le tableau Google Sheets n'est plus utilisé par le site.
