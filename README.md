# Organiseur

Mini-app locale pour s'organiser au quotidien : calendrier d'événements, to-do
liste et tâches récurrentes. Elle tourne entièrement sur votre ordinateur
(aucune donnée n'est envoyée en ligne) et les données sont enregistrées dans
`data/db.json`, à côté de l'application.

## Fonctionnalités

- **Calendrier** — vue mensuelle navigable ; cliquez sur un jour pour ajouter un
  événement (avec heure optionnelle) et retrouvez la liste des événements à venir.
- **Tâches** — to-do liste simple : ajouter, cocher, supprimer.
- **Récurrences** — rappels quotidiens, hebdomadaires ou mensuels
  (ex. « Payer URSSAF chaque mois, le 31 »). Bouton « Marquer fait » pour
  reporter à l'occurrence suivante. Si le jour n'existe pas dans un mois
  (le 31 en novembre), l'échéance passe au dernier jour de ce mois.

## Installation

Avec [Node.js](https://nodejs.org) (v20+) installé :

```bash
cd organiseur
npm install
```

## Lancement

```bash
npm start
```

Puis ouvrez [http://localhost:3001](http://localhost:3001) dans votre navigateur.
Fermez le terminal ou faites Ctrl+C pour arrêter l'application — les données
restent enregistrées dans `data/db.json` et sont restaurées au prochain
lancement.

Un port différent ? `PORT=4000 npm start`.
