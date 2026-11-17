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

---

# Version 2 : plusieurs pages, statistiques et publicité

## Ce qui a changé
- **Accueil** : un rectangle par catégorie avec les **4 derniers articles en vente** (les articles « vendus » n'y figurent pas) et un lien « Voir toute la catégorie ».
- **Une page par catégorie** (adresse du type `boutiqgeek.fr/categorie/cartes-pokemon`) avec tous ses articles, les vendus en dernier, et une recherche.
- **Pages de texte** : `boutiqgeek.fr/page/a-propos`, etc. Le menu se construit tout seul avec vos catégories et vos pages.
- Les articles sans catégorie vont dans une catégorie « Autres ».
- « Les plus récents » = date de mise en vente (champ rempli automatiquement quand vous ajoutez un article). Les anciens articles sans date restent dans l'ordre de la liste, après les articles datés.

## Mise à jour du site (une seule fois)
1. Dézippez `mise-a-jour-site-v2.zip`.
2. Sur GitHub, ouvrez le dépôt `boutiqgeek` → **Add file → Upload files**.
3. Glissez **tout le contenu** du dossier dézippé (les fichiers `.html`, `_redirects`, et les dossiers `assets` et `admin`), puis **Commit changes**. Les fichiers du même nom sont remplacés.
4. Ne touchez pas au dossier `content` : il contient vos articles et catégories actuels (il n'est volontairement pas dans le zip).
5. Netlify redéploie en environ une minute. Si le site affiche une page vide, faites Ctrl+F5.

## Google Analytics (statistiques)
1. Allez sur analytics.google.com → **Admin → Créer → Propriété**, puis **Flux de données → Web** avec l'adresse `https://boutiqgeek.fr`.
2. Copiez l'**ID de mesure** (il commence par `G-`).
3. Dans `/admin` → **Réglages du site** → **Google Analytics : ID de mesure**, collez-le, puis **Publier**.

Le site envoie aussi deux événements utiles : `voir_article` (ouverture d'une fiche) et `clic_achat` (clic sur Leboncoin, Vinted ou eBay, avec le nom de l'article). Dans Analytics, ils apparaissent dans **Rapports → Engagement → Événements** après 24 h environ.

## Bandeau publicitaire Google
Il y a deux choses différentes chez Google :
- **Google AdSense** : afficher de la pub *sur votre site* pour gagner de l'argent. C'est ce que prépare le bandeau (en haut de chaque page, sous le menu).
- **Google Ads** : payer pour *promouvoir votre boutique* sur Google. Pour suivre vos campagnes, collez l'ID de balise (`AW-…`) dans « Google Ads : ID de balise ».

Pour AdSense :
1. Créez un compte sur adsense.google.com et ajoutez le site `boutiqgeek.fr`. Google doit valider le site, ce qui peut prendre plusieurs jours, et un petit site avec peu de contenu est parfois refusé au début.
2. Copiez l'**ID éditeur** (`ca-pub-…`) dans « Bandeau pub Google AdSense : ID éditeur ».
3. Dans AdSense, créez un **bloc d'annonces display** et copiez son **ID de bloc** (des chiffres) dans « ID du bloc ».
4. Dans le dépôt GitHub, créez un fichier `ads.txt` à la racine contenant la ligne que vous donne AdSense (de la forme `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`).
5. Publiez. Tant que ces champs sont vides, aucune pub n'apparaît et rien n'est chargé.

## Cookies et RGPD
Dès qu'un ID Google est renseigné, une bannière demande l'accord des visiteurs. **Rien de Google n'est chargé avant le « Accepter »**, et un lien « Gérer les cookies » est ajouté en bas de page. Tant que aucun ID n'est saisi, ni bannière ni cookie.

Pensez à créer, dans **Pages**, une page « Confidentialité » (qui vous êtes, quels cookies Google sont utilisés, contact). Le site ne vous écrit pas ce texte légal à votre place.
