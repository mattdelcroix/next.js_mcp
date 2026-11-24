import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

// ---------- Accès aux données ----------

type Ticket = {
  id: string;
  titre: string;
  description: string;
  statut: string;
};

// Chemin absolu vers tickets.json, quel que soit le dossier d'où le serveur est lancé
const FICHIER = path.join(__dirname, "..", "tickets.json");

function lireTickets(): Ticket[] {
  return JSON.parse(readFileSync(FICHIER, "utf-8"));
}

function ecrireTickets(tickets: Ticket[]) {
  writeFileSync(FICHIER, JSON.stringify(tickets, null, 2), "utf-8");
}

function texte(contenu: string) {
  return { content: [{ type: "text" as const, text: contenu }] };
}

// ---------- Le serveur MCP ----------

/*
Trois points à retenir dans ce fichier :

- La description de chaque outil est ce que l'agent lit pour décider de l'utiliser. Écris-la comme une consigne pour un collègue.
- inputSchema décrit les paramètres. Avec z.enum, l'agent ne peut pas inventer un statut qui n'existe pas.
- lister_tickets et lire_ticket lisent, changer_statut écrit. C'est la distinction qui compte pour la sécurité.
*/

const server = new McpServer({ name: "tickets", version: "1.0.0" });

// Outil 1 : lister les tickets (lecture seule)
server.registerTool(
  "lister_tickets",
  {
    description:
      "Liste tous les tickets du projet avec leur identifiant, leur titre et leur statut. À utiliser pour savoir ce qu'il reste à faire.",
    inputSchema: {},
  },
  async () => {
    const resume = lireTickets()
      .map((t) => `${t.id} | ${t.statut} | ${t.titre}`)
      .join("\n");
    return texte(resume);
  }
);

// Outil 2 : lire un ticket (lecture seule)
server.registerTool(
  "lire_ticket",
  {
    description:
      "Renvoie le détail complet d'un ticket (titre, description, statut) à partir de son identifiant, par exemple TASK-12.",
    inputSchema: {
      ticketId: z.string().describe("Identifiant du ticket, ex : TASK-12"),
    },
  },
  async ({ ticketId }) => {
    const ticket = lireTickets().find((t) => t.id === ticketId);
    return texte(ticket ? JSON.stringify(ticket, null, 2) : `Ticket ${ticketId} introuvable`); 
  }
);

// Outil 3 : changer le statut (ÉCRITURE -> demander validation)
server.registerTool(
  "changer_statut",
  {
    description:
      "Change le statut d'un ticket. À utiliser uniquement quand le travail a été vérifié.",
    inputSchema: {
      ticketId: z.string().describe("Identifiant du ticket, ex : TASK-12"),
      statut: z.enum(["A faire", "En cours", "En revue", "Terminé"]),
    },
  },
  async ({ ticketId, statut }) => {
    const tickets = lireTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return texte(`Ticket ${ticketId} introuvable`);
    const ancien = ticket.statut;
    ticket.statut = statut;
    ecrireTickets(tickets);
    return texte(`${ticketId} : "${ancien}" -> "${statut}"`);
  }
);

// ---------- Démarrage ----------

async function main() {
  await server.connect(new StdioServerTransport());
  // IMPORTANT : console.error et jamais console.log.
  // stdout sert à dialoguer avec l'agent : un console.log casserait la communication.
  console.error("Serveur MCP tickets démarré");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});