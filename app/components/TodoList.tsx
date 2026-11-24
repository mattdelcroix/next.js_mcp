"use client";

export type Todo = {
  id: number;
  texte: string;
  fait: boolean;
};

type Props = {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function TodoList({ todos, onToggle, onDelete }: Props) {
  if (todos.length === 0) {
    return <p className="text-zinc-500 italic">Aucune tâche pour le moment.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={todo.fait}
              onChange={() => onToggle(todo.id)}
            />
            <span className={todo.fait ? "line-through text-zinc-400" : ""}>
              {todo.texte}
            </span>
          </label>
          <button
            onClick={() => onDelete(todo.id)}
            className="text-sm text-red-600 hover:underline"
          >
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}