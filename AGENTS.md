# Consignes pour l'agent

## Stack
- Next.js 16, App Router, TypeScript strict, Tailwind CSS.
- Les composants interactifs sont dans app/components et commencent par "use client".

## Outils MCP disponibles
- tickets : lister_tickets, lire_ticket, changer_statut
- next-devtools : erreurs, logs et routes de l'appli en cours d'exécution
- playwright : navigateur pour tester l'interface

## Workflow pour traiter un ticket
1. Lis le ticket avec lire_ticket.
2. Passe-le en "En cours" avec changer_statut.
3. Fais la modification la plus petite possible.
4. Vérifie avec next-devtools qu'il n'y a aucune erreur.
5. Vérifie le comportement avec playwright sur http://localhost:3000.
6. Seulement si 4 et 5 sont OK : passe le ticket en "En revue" (jamais "Terminé", c'est moi qui valide).
7. Résume ce que tu as changé et comment tu l'as vérifié.

## Interdits
- Ne modifie jamais tickets.json directement : utilise l'outil changer_statut.
- Ne modifie jamais .vscode/mcp.json.
- N'installe aucune dépendance sans me demander.