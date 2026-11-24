# Todo MCP Lab

> 🇫🇷 [Français](#-français) · 🇬🇧 [English](#-english)

---

# 🇫🇷 Français

## Objectif du projet

Ce projet est un **support pédagogique** pour comprendre le **Model Context Protocol (MCP)** en pratique.

Il contient :

- une petite application de gestion de tâches en **Next.js 16** qui comporte **volontairement des défauts** ;
- un **serveur MCP maison** (`tickets`) qui donne à un agent IA l'accès à une liste de tickets ;
- deux **serveurs MCP existants** : `next-devtools` (erreurs et logs de l'appli Next.js) et `playwright` (pilotage d'un navigateur).

Le but est de faire traiter **3 tickets** par l'agent IA de VSCode (GitHub Copilot, mode Agent). L'agent utilise les outils fournis par les serveurs MCP pour lire le ticket, corriger le code, vérifier son travail et mettre à jour le statut du ticket.

> 💡 **Précision importante :** ce n'est pas le serveur MCP qui résout les tickets. Le serveur MCP **fournit des outils** (lire un ticket, changer un statut, ouvrir un navigateur…). C'est **l'agent IA** qui décide quand et comment utiliser ces outils pour faire le travail.
>
> - `AGENTS.md` = la **fiche de poste** de l'agent (ce qu'il doit faire et comment)
> - Serveurs MCP = sa **boîte à outils** (ce qu'il peut faire)

---

## 1. Prérequis

| Outil | Version | Vérification |
|---|---|---|
| Node.js | **20.19 ou plus** (22 LTS recommandée) | `node -v` |
| npm | fourni avec Node.js | `npm -v` |
| Git | toute version récente | `git --version` |
| Visual Studio Code | dernière version | — |
| Extension GitHub Copilot | avec accès au mode **Agent** | icône Copilot dans la barre de titre |

---

## 2. Installation et lancement de l'application

Cette étape doit fonctionner **avant** de toucher à MCP. Prends le temps de la valider.

### 2.1 Récupérer le projet et installer les dépendances

Place-toi dans le dossier du projet, puis installe les dépendances :

```bash
cd mon-app
npm install
```

`npm install` lit le fichier `package.json` et télécharge dans le dossier `node_modules/` tout ce dont le projet a besoin : Next.js, React, le SDK MCP, zod, tsx…

✅ **Résultat attendu :** la commande se termine sans erreur rouge (des messages `warn` en jaune sont sans gravité).

### 2.2 Lancer l'application

```bash
npm run dev
```

✅ **Résultat attendu dans le terminal :**

```
▲ Next.js 16.x
- Local: http://localhost:3000
✓ Ready
```

**Laisse ce terminal ouvert** pendant toute la séance : les serveurs MCP `next-devtools` et `playwright` ont besoin que l'application tourne. Pour arrêter l'application : `Ctrl + C`.

### 2.3 Vérifier l'application dans le navigateur

Ouvre **http://localhost:3000**.

✅ **Tu dois voir :**

- le titre **« Mes tâches »** et une ligne « Page chargée à … » ;
- un champ « Nouvelle tâche » et un bouton **Ajouter** ;
- deux tâches : « Réviser le domaine Personnes du PMP » (non cochée) et « Tester un serveur MCP » (cochée, barrée).

⚠️ **C'est normal si :**

- un **badge rouge** apparaît en bas à gauche de la page → c'est le ticket **TASK-14** ;
- cliquer sur **Ajouter** avec un champ vide ne fait **rien** → c'est le ticket **TASK-12** ;
- aucun compteur de tâches n'est affiché → c'est le ticket **TASK-13**.

### 2.4 Tester le serveur MCP `tickets` seul (sans agent)

Dans un **deuxième terminal** :

```bash
npx @modelcontextprotocol/inspector npm run mcp:tickets
```

Une page s'ouvre dans le navigateur (le MCP Inspector) :

1. clique sur **Connect** ;
2. onglet **Tools** → **List Tools** ;
3. tu dois voir 3 outils : `lister_tickets`, `lire_ticket`, `changer_statut` ;
4. clique sur `lire_ticket`, saisis `TASK-12`, puis **Run Tool** → le ticket s'affiche.

✅ Tu viens de faire **à la main** ce que l'agent fera **tout seul**. Ferme l'Inspector avec `Ctrl + C`.

### 2.5 Créer un point de sauvegarde Git

Avant de laisser l'agent modifier le code, sauvegarde l'état initial (avec les bugs) :

```bash
git add .
git commit -m "Base du lab MCP : appli avec bugs + serveur tickets"
```

Tu pourras revenir à cet état à tout moment (voir [section 6](#6-rejouer-les-exercices)).

---

## 3. Brancher les serveurs MCP sur l'agent

### 3.1 Démarrer les serveurs

Ouvre `.vscode/mcp.json` dans VSCode. Au-dessus de chaque serveur, clique sur **Démarrer**.

✅ **Résultat attendu :** chaque serveur affiche **« En cours d'exécution »** avec un nombre d'outils.

| Serveur | Fourni par | Rôle | Exemples d'outils |
|---|---|---|---|
| `tickets` | ce projet (`mcp/tickets.ts`) | lire et mettre à jour les tickets | `lister_tickets`, `lire_ticket`, `changer_statut` |
| `next-devtools` | Vercel | lire les erreurs, logs et routes de l'appli en cours | `nextjs_index`, `nextjs_call` |
| `playwright` | Microsoft | piloter un navigateur | `browser_navigate`, `browser_click`, `browser_snapshot` |

> 🍎 **Sur Mac, si les 3 serveurs sont en « Erreur » :** VSCode ne trouve probablement pas `npx`. Deux solutions :
> - quitte VSCode (`Cmd + Q`) et relance-le depuis le terminal avec `code .` dans le dossier du projet ;
> - ou renseigne le chemin complet de `npx` (obtenu avec `which npx`) dans `"command"` et ajoute `"env": { "PATH": "<dossier de npx>:/usr/bin:/bin" }` à chaque serveur.

### 3.2 Vérifier que l'agent voit les outils

1. Ouvre le chat Copilot (`Ctrl + Cmd + I` sur Mac, `Ctrl + Alt + I` sur Windows/Linux) ;
2. choisis **Agent** dans le sélecteur en bas du chat ;
3. tape `#` dans la zone de saisie : la liste des outils disponibles s'affiche ;
4. ou demande simplement : *« Quels outils MCP as-tu à ta disposition ? Liste-les par serveur. »*

✅ **Résultat attendu :** l'agent cite les outils des 3 serveurs.

---

## 4. Le workflow imposé à l'agent

Le fichier `AGENTS.md` impose à l'agent ce workflow pour **chaque** ticket :

1. lire le ticket avec `lire_ticket` ;
2. passer le ticket en **« En cours »** avec `changer_statut` ;
3. faire la **plus petite modification possible** ;
4. vérifier avec `next-devtools` qu'il n'y a **aucune erreur** ;
5. vérifier le comportement avec `playwright` sur http://localhost:3000 ;
6. si 4 et 5 sont OK : passer le ticket en **« En revue »** (jamais « Terminé » : c'est l'humain qui valide) ;
7. résumer ce qui a été changé et comment cela a été vérifié.

🔐 **À chaque appel d'outil MCP, VSCode demande ton autorisation.** Lis toujours ce que l'agent s'apprête à faire avant de cliquer sur **Autoriser**, en particulier pour `changer_statut`, qui **écrit** dans `tickets.json`.

---

## 5. Les 3 tickets à faire résoudre

Les tickets sont stockés dans `tickets.json`. Ordre conseillé : **TASK-12 → TASK-13 → TASK-14** (du plus simple au plus complexe).

> 💡 Exercice d'échauffement : demande à l'agent *« Quels tickets reste-t-il à traiter ? Classe-les du plus simple au plus complexe. »* Il doit appeler `lister_tickets` puis `lire_ticket` sur chacun, sans que tu lui aies dit quels outils utiliser.

---

### 🎫 TASK-12 — Bouton Ajouter sans message d'erreur

**Problème :** quand le champ est vide, cliquer sur **Ajouter** ne fait rien. L'utilisateur ne comprend pas pourquoi.

**Prompt à saisir :**

```
Traite le ticket TASK-12 en suivant le workflow d'AGENTS.md.
```

**Fil d'exécution attendu :**

| # | Action de l'agent | Outil | Serveur MCP | Ta validation |
|---|---|---|---|---|
| 1 | Lit le ticket | `lire_ticket("TASK-12")` | tickets | ✅ Autoriser |
| 2 | Passe le ticket en « En cours » | `changer_statut("TASK-12", "En cours")` | tickets | ✅ Autoriser |
| 3 | Cherche le formulaire, trouve `app/components/AddTodoForm.tsx` | lecture de fichiers | — (outil intégré) | — |
| 4 | Ajoute un état `erreur` et le message sous le formulaire | édition de fichier | — (outil intégré) | ✅ Relire le diff |
| 5 | Vérifie qu'il n'y a pas d'erreur de compilation | `nextjs_call` (erreurs) | next-devtools | ✅ Autoriser |
| 6 | Ouvre l'appli, clique sur **Ajouter** avec le champ vide, lit la page | `browser_navigate`, `browser_click`, `browser_snapshot` | playwright | ✅ Autoriser |
| 7 | Saisit une tâche, clique sur **Ajouter**, vérifie que le message disparaît | `browser_type`, `browser_click`, `browser_snapshot` | playwright | ✅ Autoriser |
| 8 | Passe le ticket en « En revue » | `changer_statut("TASK-12", "En revue")` | tickets | ✅ Autoriser |

**Résultat attendu :**

- champ vide + clic sur **Ajouter** → le message **« Saisis une tâche »** s'affiche **en rouge** sous le champ ;
- saisie d'une tâche valide + clic → la tâche est ajoutée et **le message disparaît** ;
- seul `AddTodoForm.tsx` est modifié ;
- dans `tickets.json`, TASK-12 a le statut **« En revue »**.

**Ce que cet exercice montre :** la **boucle de vérification** complète. L'agent ne dit pas « je pense que ça marche », il l'a constaté dans un vrai navigateur.

---

### 🎫 TASK-13 — Compteur de tâches restantes

**Problème :** il manque une information : combien de tâches reste-t-il à faire ?

**Prompt à saisir :**

```
Traite le ticket TASK-13. Avant de coder, propose-moi ton plan et attends ma validation.
```

**Fil d'exécution attendu :**

| # | Action de l'agent | Outil | Serveur MCP | Ta validation |
|---|---|---|---|---|
| 1 | Lit le ticket | `lire_ticket("TASK-13")` | tickets | ✅ Autoriser |
| 2 | **Propose un plan et s'arrête** (ex. : calculer `todos.filter(t => !t.fait).length` dans `TodoApp.tsx` et afficher la phrase avec le bon pluriel) | aucun | — | ✍️ Répondre « OK » |
| 3 | Passe le ticket en « En cours » | `changer_statut("TASK-13", "En cours")` | tickets | ✅ Autoriser |
| 4 | Modifie `app/components/TodoApp.tsx` | édition de fichier | — (outil intégré) | ✅ Relire le diff |
| 5 | Vérifie l'absence d'erreur | `nextjs_call` (erreurs) | next-devtools | ✅ Autoriser |
| 6 | Vérifie l'affichage initial : **1 tâche restante** | `browser_navigate`, `browser_snapshot` | playwright | ✅ Autoriser |
| 7 | Coche la tâche restante → **0 tâche restante** | `browser_click`, `browser_snapshot` | playwright | ✅ Autoriser |
| 8 | Ajoute deux tâches → **2 tâches restantes** | `browser_type`, `browser_click`, `browser_snapshot` | playwright | ✅ Autoriser |
| 9 | Passe le ticket en « En revue » | `changer_statut("TASK-13", "En revue")` | tickets | ✅ Autoriser |

**Résultat attendu :**

- sous le titre, une ligne du type **« 1 tâche restante »** ;
- le compteur se met à jour **immédiatement** quand on coche, décoche, ajoute ou supprime une tâche ;
- le pluriel est correct : « 0 tâche restante », « 1 tâche restante », « 2 tâches restantes » ;
- dans `tickets.json`, TASK-13 a le statut **« En revue »**.

**Ce que cet exercice montre :** on peut combiner les outils MCP avec une **validation humaine en amont**. C'est le réflexe du chef de projet : valider la conception avant la réalisation.

---

### 🎫 TASK-14 — Erreur rouge en bas de l'écran au chargement

**Problème :** un badge d'erreur rouge apparaît en bas à gauche de la page. Le ticket **ne donne aucun indice** sur la cause.

**Prompt à saisir :**

```
Traite le ticket TASK-14. Je ne sais pas d'où vient l'erreur.
```

**Fil d'exécution attendu :**

| # | Action de l'agent | Outil | Serveur MCP | Ta validation |
|---|---|---|---|---|
| 1 | Lit le ticket | `lire_ticket("TASK-14")` | tickets | ✅ Autoriser |
| 2 | Passe le ticket en « En cours » | `changer_statut("TASK-14", "En cours")` | tickets | ✅ Autoriser |
| 3 | **Interroge l'appli en cours d'exécution** pour lire les erreurs | `nextjs_index`, puis `nextjs_call` (erreurs) | next-devtools | ✅ Autoriser |
| 4 | Identifie une **erreur d'hydratation** : le texte « Page chargée à … » calculé par le serveur diffère de celui calculé par le navigateur | analyse | — | — |
| 5 | Remonte à la ligne `new Date().toLocaleTimeString()` dans `TodoApp.tsx` | lecture de fichiers | — (outil intégré) | — |
| 6 | Corrige : calcule l'heure côté navigateur uniquement (`useState` + `useEffect`) | édition de fichier | — (outil intégré) | ✅ Relire le diff |
| 7 | **Redemande les erreurs** à Next.js → la liste est vide | `nextjs_call` (erreurs) | next-devtools | ✅ Autoriser |
| 8 | Recharge la page et vérifie l'absence de badge rouge | `browser_navigate`, `browser_snapshot` | playwright | ✅ Autoriser |
| 9 | Passe le ticket en « En revue » | `changer_statut("TASK-14", "En revue")` | tickets | ✅ Autoriser |

**Résultat attendu :**

- plus aucun **badge rouge** en bas à gauche de la page ;
- la ligne « Page chargée à HH:MM:SS » s'affiche toujours (éventuellement après une fraction de seconde) ;
- `next-devtools` ne remonte **aucune erreur** ;
- dans `tickets.json`, TASK-14 a le statut **« En revue »**.

**Ce que cet exercice montre :** c'est l'exemple le plus parlant de MCP. **Sans MCP**, c'est toi qui dois ouvrir la console, copier l'erreur et la coller dans le chat. **Avec MCP**, l'agent va chercher l'information directement là où elle se trouve.

---

## 6. Rejouer les exercices

Pour revenir à l'état initial (appli avec bugs, tickets « A faire ») :

```bash
git status            # voir ce qui a changé
git restore .         # annuler les modifications des fichiers suivis (dont tickets.json)
git clean -n -d       # SIMULER la suppression des nouveaux fichiers
git clean -f -d       # supprimer les nouveaux fichiers (définitif !)
```

> ⚠️ `git restore` et `git clean -f` sont **définitifs**. Ces commandes ne sont sûres **que si** tu as fait le commit de l'[étape 2.5](#25-créer-un-point-de-sauvegarde-git). En cas de doute, utilise `git stash -u` (met les changements de côté, récupérables avec `git stash pop`).

---

## 7. Structure du projet

```
mon-app/
├── app/
│   ├── components/
│   │   ├── AddTodoForm.tsx   ← formulaire d'ajout (TASK-12)
│   │   ├── TodoApp.tsx       ← composant principal (TASK-13, TASK-14)
│   │   └── TodoList.tsx      ← liste des tâches
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx              ← page d'accueil
├── mcp/
│   └── tickets.ts            ← serveur MCP maison (3 outils)
├── .vscode/
│   └── mcp.json              ← déclaration des 3 serveurs MCP
├── tickets.json              ← les tickets (données du serveur MCP)
├── AGENTS.md                 ← consignes et workflow de l'agent
└── package.json              ← script "mcp:tickets"
```

---

## 8. En cas de problème

| Symptôme | Cause probable | Solution |
|---|---|---|
| `npm run dev` échoue | dépendances non installées | relancer `npm install` |
| Les 3 serveurs MCP sont en « Erreur » | VSCode ne trouve pas `npx` (fréquent sur Mac) | voir l'encadré 🍎 de la [section 3.1](#31-démarrer-les-serveurs) |
| Seul `tickets` est en erreur | dossier ouvert dans VSCode incorrect, ou `npm install` non fait | ouvrir exactement le dossier `mon-app`, relancer `npm install` |
| Erreur liée à `zod` au démarrage de `tickets` | incompatibilité de versions | `npm install -D zod@3` |
| `next-devtools` ne trouve pas l'appli | `npm run dev` n'est pas lancé | lancer l'appli puis redémarrer le serveur MCP |
| Playwright n'arrive pas à ouvrir de navigateur | navigateur non installé | `npx playwright install chromium` |
| Le serveur `tickets` plante sans message clair | un `console.log` dans `mcp/tickets.ts` | le remplacer par `console.error` (stdout est réservé au dialogue avec l'agent) |
| L'agent ne voit pas les outils | serveurs non démarrés ou mode Agent non sélectionné | voir [section 3.2](#32-vérifier-que-lagent-voit-les-outils) |

---

## 9. Points clés à retenir

1. **Un serveur MCP, ce sont des fonctions avec une description.** L'agent lit la description pour décider quand utiliser l'outil : elle doit être écrite comme une consigne pour un collègue.
2. **zod décrit les paramètres** de chaque outil. Il génère la documentation envoyée à l'agent, vérifie les données reçues et type le code TypeScript.
3. **Lecture ≠ écriture.** `lister_tickets` et `lire_ticket` sont sans risque, `changer_statut` modifie des données : son schéma est strict (`z.enum`) et il demande toujours une validation.
4. **Ne jamais désactiver la validation manuelle** des appels d'outils, et n'installer que des serveurs MCP de sources fiables.

---
---

# 🇬🇧 English

## Project goal

This project is a **learning lab** to understand the **Model Context Protocol (MCP)** hands-on.

It contains:

- a small **Next.js 16** to-do application that **intentionally contains defects**;
- a **custom MCP server** (`tickets`) that gives an AI agent access to a list of tickets;
- two **existing MCP servers**: `next-devtools` (errors and logs of the running Next.js app) and `playwright` (browser automation).

The goal is to have **3 tickets** resolved by the VS Code AI agent (GitHub Copilot, Agent mode). The agent uses the tools exposed by the MCP servers to read the ticket, fix the code, verify its work and update the ticket status.

> 💡 **Important:** the MCP server does not resolve the tickets itself. The MCP server **provides tools** (read a ticket, change a status, open a browser…). The **AI agent** decides when and how to use those tools to get the job done.
>
> - `AGENTS.md` = the agent's **job description** (what it must do and how)
> - MCP servers = its **toolbox** (what it can do)

---

## 1. Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | **20.19 or later** (22 LTS recommended) | `node -v` |
| npm | bundled with Node.js | `npm -v` |
| Git | any recent version | `git --version` |
| Visual Studio Code | latest | — |
| GitHub Copilot extension | with access to **Agent** mode | Copilot icon in the title bar |

---

## 2. Installing and running the application

This step must work **before** you touch MCP. Take the time to validate it.

### 2.1 Get the project and install dependencies

Go to the project folder and install dependencies:

```bash
cd mon-app
npm install
```

`npm install` reads `package.json` and downloads everything the project needs into `node_modules/`: Next.js, React, the MCP SDK, zod, tsx…

✅ **Expected result:** the command ends without red errors (yellow `warn` messages are harmless).

### 2.2 Run the application

```bash
npm run dev
```

✅ **Expected output in the terminal:**

```
▲ Next.js 16.x
- Local: http://localhost:3000
✓ Ready
```

**Keep this terminal open** for the whole session: the `next-devtools` and `playwright` MCP servers need the app to be running. To stop the app: `Ctrl + C`.

### 2.3 Check the application in the browser

Open **http://localhost:3000**.

✅ **You should see:**

- the title **"Mes tâches"** and a line "Page chargée à …" (page loaded at …);
- a "Nouvelle tâche" (new task) input and an **Ajouter** (Add) button;
- two tasks: "Réviser le domaine Personnes du PMP" (unchecked) and "Tester un serveur MCP" (checked, struck through).

⚠️ **This is expected:**

- a **red badge** appears at the bottom left of the page → that's ticket **TASK-14**;
- clicking **Ajouter** with an empty input does **nothing** → that's ticket **TASK-12**;
- no task counter is displayed → that's ticket **TASK-13**.

### 2.4 Test the `tickets` MCP server on its own (no agent)

In a **second terminal**:

```bash
npx @modelcontextprotocol/inspector npm run mcp:tickets
```

A page opens in your browser (the MCP Inspector):

1. click **Connect**;
2. **Tools** tab → **List Tools**;
3. you should see 3 tools: `lister_tickets`, `lire_ticket`, `changer_statut`;
4. click `lire_ticket`, enter `TASK-12`, then **Run Tool** → the ticket is displayed.

✅ You just did **by hand** what the agent will do **on its own**. Close the Inspector with `Ctrl + C`.

### 2.5 Create a Git checkpoint

Before letting the agent change any code, save the initial state (with the bugs):

```bash
git add .
git commit -m "MCP lab baseline: buggy app + tickets server"
```

You can return to this state at any time (see [section 6](#6-replaying-the-exercises)).

---

## 3. Connecting the MCP servers to the agent

### 3.1 Start the servers

Open `.vscode/mcp.json` in VS Code. Above each server, click **Start**.

✅ **Expected result:** each server shows **"Running"** with a number of tools.

| Server | Provided by | Role | Example tools |
|---|---|---|---|
| `tickets` | this project (`mcp/tickets.ts`) | read and update tickets | `lister_tickets`, `lire_ticket`, `changer_statut` |
| `next-devtools` | Vercel | read errors, logs and routes of the running app | `nextjs_index`, `nextjs_call` |
| `playwright` | Microsoft | drive a browser | `browser_navigate`, `browser_click`, `browser_snapshot` |

> 🍎 **On macOS, if all 3 servers show "Error":** VS Code most likely cannot find `npx`. Two fixes:
> - quit VS Code (`Cmd + Q`) and relaunch it from the terminal with `code .` inside the project folder;
> - or set the full path of `npx` (from `which npx`) in `"command"` and add `"env": { "PATH": "<npx folder>:/usr/bin:/bin" }` to each server.

### 3.2 Check that the agent sees the tools

1. Open Copilot Chat (`Ctrl + Cmd + I` on macOS, `Ctrl + Alt + I` on Windows/Linux);
2. select **Agent** in the picker at the bottom of the chat;
3. type `#` in the input field: the list of available tools appears;
4. or simply ask: *"Which MCP tools do you have? List them by server."*

✅ **Expected result:** the agent lists the tools from all 3 servers.

---

## 4. The workflow enforced on the agent

`AGENTS.md` requires the agent to follow this workflow for **every** ticket:

1. read the ticket with `lire_ticket`;
2. move the ticket to **"En cours"** (in progress) with `changer_statut`;
3. make the **smallest possible change**;
4. check with `next-devtools` that there are **no errors**;
5. check the behaviour with `playwright` on http://localhost:3000;
6. if 4 and 5 pass: move the ticket to **"En revue"** (in review), never "Terminé" (done): a human validates;
7. summarise what was changed and how it was verified.

🔐 **VS Code asks for your approval on every MCP tool call.** Always read what the agent is about to do before clicking **Allow**, especially for `changer_statut`, which **writes** to `tickets.json`.

> ℹ️ Ticket content, tool names and statuses are in French (`A faire` = to do, `En cours` = in progress, `En revue` = in review, `Terminé` = done). You can write your prompts in English: the agent will handle it.

---

## 5. The 3 tickets to resolve

Tickets are stored in `tickets.json`. Suggested order: **TASK-12 → TASK-13 → TASK-14** (simplest to most complex).

> 💡 Warm-up exercise: ask the agent *"Which tickets are left to handle? Rank them from simplest to most complex."* It should call `lister_tickets` and then `lire_ticket` on each one, without you telling it which tools to use.

---

### 🎫 TASK-12 — Add button gives no error message

**Problem:** when the input is empty, clicking **Ajouter** does nothing. The user doesn't understand why.

**Prompt:**

```
Handle ticket TASK-12 following the workflow in AGENTS.md.
```

**Expected execution flow:**

| # | Agent action | Tool | MCP server | Your approval |
|---|---|---|---|---|
| 1 | Reads the ticket | `lire_ticket("TASK-12")` | tickets | ✅ Allow |
| 2 | Moves the ticket to "En cours" | `changer_statut("TASK-12", "En cours")` | tickets | ✅ Allow |
| 3 | Looks for the form, finds `app/components/AddTodoForm.tsx` | file reading | — (built-in tool) | — |
| 4 | Adds an `erreur` state and the message below the form | file editing | — (built-in tool) | ✅ Review the diff |
| 5 | Checks there are no compilation errors | `nextjs_call` (errors) | next-devtools | ✅ Allow |
| 6 | Opens the app, clicks **Ajouter** with an empty input, reads the page | `browser_navigate`, `browser_click`, `browser_snapshot` | playwright | ✅ Allow |
| 7 | Types a task, clicks **Ajouter**, checks the message disappears | `browser_type`, `browser_click`, `browser_snapshot` | playwright | ✅ Allow |
| 8 | Moves the ticket to "En revue" | `changer_statut("TASK-12", "En revue")` | tickets | ✅ Allow |

**Expected result:**

- empty input + click **Ajouter** → the message **"Saisis une tâche"** (enter a task) appears **in red** below the input;
- valid task + click → the task is added and **the message disappears**;
- only `AddTodoForm.tsx` is modified;
- in `tickets.json`, TASK-12 has status **"En revue"**.

**What this exercise shows:** the full **verification loop**. The agent doesn't say "I think it works": it observed it in a real browser.

---

### 🎫 TASK-13 — Remaining tasks counter

**Problem:** a piece of information is missing: how many tasks are left to do?

**Prompt:**

```
Handle ticket TASK-13. Before coding, propose your plan and wait for my approval.
```

**Expected execution flow:**

| # | Agent action | Tool | MCP server | Your approval |
|---|---|---|---|---|
| 1 | Reads the ticket | `lire_ticket("TASK-13")` | tickets | ✅ Allow |
| 2 | **Proposes a plan and stops** (e.g. compute `todos.filter(t => !t.fait).length` in `TodoApp.tsx` and display the sentence with correct plural) | none | — | ✍️ Reply "OK" |
| 3 | Moves the ticket to "En cours" | `changer_statut("TASK-13", "En cours")` | tickets | ✅ Allow |
| 4 | Edits `app/components/TodoApp.tsx` | file editing | — (built-in tool) | ✅ Review the diff |
| 5 | Checks there are no errors | `nextjs_call` (errors) | next-devtools | ✅ Allow |
| 6 | Checks the initial display: **1 tâche restante** | `browser_navigate`, `browser_snapshot` | playwright | ✅ Allow |
| 7 | Checks the remaining task → **0 tâche restante** | `browser_click`, `browser_snapshot` | playwright | ✅ Allow |
| 8 | Adds two tasks → **2 tâches restantes** | `browser_type`, `browser_click`, `browser_snapshot` | playwright | ✅ Allow |
| 9 | Moves the ticket to "En revue" | `changer_statut("TASK-13", "En revue")` | tickets | ✅ Allow |

**Expected result:**

- below the title, a line such as **"1 tâche restante"** (1 task remaining);
- the counter updates **immediately** when a task is checked, unchecked, added or deleted;
- French plural is correct: "0 tâche restante", "1 tâche restante", "2 tâches restantes";
- in `tickets.json`, TASK-13 has status **"En revue"**.

**What this exercise shows:** MCP tools can be combined with **upfront human approval**. It's the project manager's reflex: validate the design before the build.

---

### 🎫 TASK-14 — Red error at the bottom of the screen on load

**Problem:** a red error badge appears at the bottom left of the page. The ticket gives **no clue** about the cause.

**Prompt:**

```
Handle ticket TASK-14. I don't know where the error comes from.
```

**Expected execution flow:**

| # | Agent action | Tool | MCP server | Your approval |
|---|---|---|---|---|
| 1 | Reads the ticket | `lire_ticket("TASK-14")` | tickets | ✅ Allow |
| 2 | Moves the ticket to "En cours" | `changer_statut("TASK-14", "En cours")` | tickets | ✅ Allow |
| 3 | **Queries the running app** for errors | `nextjs_index`, then `nextjs_call` (errors) | next-devtools | ✅ Allow |
| 4 | Identifies a **hydration error**: the "Page chargée à …" text rendered on the server differs from the one rendered in the browser | analysis | — | — |
| 5 | Traces it to `new Date().toLocaleTimeString()` in `TodoApp.tsx` | file reading | — (built-in tool) | — |
| 6 | Fixes it: computes the time in the browser only (`useState` + `useEffect`) | file editing | — (built-in tool) | ✅ Review the diff |
| 7 | **Asks Next.js for errors again** → the list is empty | `nextjs_call` (errors) | next-devtools | ✅ Allow |
| 8 | Reloads the page and checks the red badge is gone | `browser_navigate`, `browser_snapshot` | playwright | ✅ Allow |
| 9 | Moves the ticket to "En revue" | `changer_statut("TASK-14", "En revue")` | tickets | ✅ Allow |

**Expected result:**

- no more **red badge** at the bottom left of the page;
- the "Page chargée à HH:MM:SS" line is still displayed (possibly after a split second);
- `next-devtools` reports **no errors**;
- in `tickets.json`, TASK-14 has status **"En revue"**.

**What this exercise shows:** this is the most telling MCP example. **Without MCP**, you have to open the console, copy the error and paste it into the chat. **With MCP**, the agent fetches the information directly where it lives.

---

## 6. Replaying the exercises

To return to the initial state (buggy app, tickets "A faire"):

```bash
git status            # see what changed
git restore .         # discard changes to tracked files (including tickets.json)
git clean -n -d       # DRY RUN: list new files that would be deleted
git clean -f -d       # delete new files (permanent!)
```

> ⚠️ `git restore` and `git clean -f` are **permanent**. These commands are only safe **if** you made the commit in [step 2.5](#25-create-a-git-checkpoint). When in doubt, use `git stash -u` (sets changes aside; get them back with `git stash pop`).

---

## 7. Project structure

```
mon-app/
├── app/
│   ├── components/
│   │   ├── AddTodoForm.tsx   ← add form (TASK-12)
│   │   ├── TodoApp.tsx       ← main component (TASK-13, TASK-14)
│   │   └── TodoList.tsx      ← task list
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx              ← home page
├── mcp/
│   └── tickets.ts            ← custom MCP server (3 tools)
├── .vscode/
│   └── mcp.json              ← declares the 3 MCP servers
├── tickets.json              ← tickets (MCP server data)
├── AGENTS.md                 ← agent instructions and workflow
└── package.json              ← "mcp:tickets" script
```

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm run dev` fails | dependencies not installed | run `npm install` again |
| All 3 MCP servers show "Error" | VS Code can't find `npx` (common on macOS) | see the 🍎 note in [section 3.1](#31-start-the-servers) |
| Only `tickets` fails | wrong folder opened in VS Code, or `npm install` not run | open exactly the `mon-app` folder, run `npm install` |
| `zod`-related error when `tickets` starts | version mismatch | `npm install -D zod@3` |
| `next-devtools` can't find the app | `npm run dev` isn't running | start the app, then restart the MCP server |
| Playwright can't open a browser | browser not installed | `npx playwright install chromium` |
| `tickets` server crashes with no clear message | a `console.log` in `mcp/tickets.ts` | replace it with `console.error` (stdout is reserved for talking to the agent) |
| The agent doesn't see the tools | servers not started or Agent mode not selected | see [section 3.2](#32-check-that-the-agent-sees-the-tools) |

---

## 9. Key takeaways

1. **An MCP server is a set of functions with descriptions.** The agent reads the description to decide when to use a tool: write it like an instruction to a colleague.
2. **zod describes each tool's parameters.** It generates the documentation sent to the agent, validates incoming data and types the TypeScript code.
3. **Read ≠ write.** `lister_tickets` and `lire_ticket` are harmless; `changer_statut` modifies data, so its schema is strict (`z.enum`) and it always requires approval.
4. **Never disable manual approval** of tool calls, and only install MCP servers from trusted sources.
