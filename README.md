# Organiseur

Mini-app pour s'organiser au quotidien : calendrier d'événements, to-do liste
et tâches récurrentes. **Deux modes disponibles** :

- **GitHub Pages (sans installation)** — version autonome dans `docs/index.html` :
  une simple page web, vos données stockées dans le navigateur (localStorage).
- **Version serveur** — ce dossier : serveur Node/Express, données dans
  `data/db.json`, protection par mot de passe optionnelle, hébergeable
  gratuitement (ex. Render).

## Fonctionnalités

- **Calendrier** — vue mensuelle navigable ; cliquez sur un jour pour ajouter un
  événement (avec heure optionnelle) et retrouvez la liste des événements à venir.
- **Tâches** — to-do liste simple : ajouter, cocher, supprimer.
- **Récurrences** — rappels quotidiens, hebdomadaires ou mensuels
  (ex. « Payer URSSAF chaque mois, le 31 »). Bouton « Marquer fait » pour
  reporter à l'occurrence suivante. Si le jour n'existe pas dans un mois
  (le 31 en novembre), l'échéance passe au dernier jour de ce mois.
- La version serveur ajoute export/import JSON (boutons en bas de page),
  et un mot de passe optionnel via la variable d'environnement `APP_PASSWORD`.
  La version Pages embarque aussi export/import pour sauvegarder ou changer
  d'appareil.

## Mode GitHub Pages (zéro installation)

L'app est servie en ligne (`main` / dossier `docs/`) : ouvrez simplement
l'URL Pages du dépôt. Les données vivent dans le navigateur de l'appareil
(non synchronisées entre appareils — utilisez Exporter/Importer pour
transférer vos données).

## Mode serveur local

Avec [Node.js](https://nodejs.org) (v20+) installé :

```bash
npm install
npm start
```

Puis ouvrez [http://localhost:3001](http://localhost:3001). Port différent ?
`PORT=4000 npm start`.

## Mode serveur hébergé (Render)

1. Créez un compte sur [render.com](https://render.com)
2. **New → Blueprint**, puis sélectionnez ce dépôt : le fichier `render.yaml`
   configure tout (service web Node gratuit)
3. Renseignez la variable `APP_PASSWORD` quand elle est demandée (recommendé :
   sans elle, quiconque a l'URL peut consulter vos données)
4. Déployez, puis utilisez l'URL fournie depuis n'importe quel appareil

⚠️ Sur le plan gratuit de Render, le disque est temporaire : les données
(`data/db.json`) sont réinitialisées à chaque redéploiement. Le plan payant
avec disque persistant, ou un export/import régulier, permettent de
conserver vos données.
