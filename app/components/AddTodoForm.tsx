"use client";

import { useState } from "react";

type Props = {
  onAdd: (texte: string) => void;
};

export default function AddTodoForm({ onAdd }: Props) {
  const [texte, setTexte] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!texte.trim()) return; // BUG : on sort sans prévenir l'utilisateur
    onAdd(texte.trim());
    setTexte("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        placeholder="Nouvelle tâche"
        className="flex-1 rounded border border-zinc-300 px-3 py-2"
      />
      <button
        type="submit"
        className="rounded bg-black px-4 py-2 text-white hover:bg-zinc-800"
      >
        Ajouter
      </button>
    </form>
  );
}