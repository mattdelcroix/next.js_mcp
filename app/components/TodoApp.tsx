"use client";

import { useState } from "react";
import AddTodoForm from "./AddTodoForm";
import TodoList, { Todo } from "./TodoList";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, texte: "Réviser le domaine Personnes du PMP", fait: false },
    { id: 2, texte: "Tester un serveur MCP", fait: true },
  ]);

  function ajouter(texte: string) {
    setTodos([...todos, { id: Date.now(), texte, fait: false }]);
  }

  function basculer(id: number) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, fait: !t.fait } : t)));
  }

  function supprimer(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">Mes tâches</h1>
        {/* BUG : l'heure calculée côté serveur et côté navigateur diffère -> erreur d'hydratation */}
        <p className="text-sm text-zinc-500">
          Page chargée à {new Date().toLocaleTimeString("fr-FR")}
        </p>
      </header>
      <AddTodoForm onAdd={ajouter} />
      <TodoList todos={todos} onToggle={basculer} onDelete={supprimer} />
    </div>
  );
}