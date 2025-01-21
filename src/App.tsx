import React, { useState, useEffect } from "react";
import { PlusCircle, Trash2, CheckCircle, Circle } from "lucide-react";
import config from "./config";

interface Todo {
  _id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/todos`);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(`${config.apiUrl}/api/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTodo }),
      });
      const data = await response.json();
      setTodos([...todos, data]);
      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      await fetch(`${config.apiUrl}/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      });
      setTodos(todos.map((todo) => (todo._id === id ? { ...todo, completed: !completed } : todo)));
    } catch (error) {
      console.error("Error toggling todo:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      // Optimistically update the UI
      const updatedTodos = todos.filter((todo) => todo._id !== id);
      setTodos(updatedTodos);

      const response = await fetch(`${config.apiUrl}/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete the todo");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      // Rollback the optimistic update if an error occurs
      fetchTodos(); // Refetch the todos to ensure the state is consistent
    }
  };

  console.log("todos:", todos);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 py-8 flex items-center justify-center">
      <div className="w-full max-w-2xl px-6">
        <div className="bg-white shadow-2xl rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">Ma Liste de Tâches</h1>

          <form onSubmit={addTodo} className="flex items-center gap-4 mb-8">
            <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Ajouter une nouvelle tâche..." className="flex-1 px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <button type="submit" className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-transform transform hover:scale-105">
              <PlusCircle size={20} />
              Ajouter
            </button>
          </form>

          <ul className="space-y-4">
            {todos.map((todo) => (
              <li key={todo._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm transition-all transform hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleTodo(todo._id, todo.completed)} className={`transition-colors ${todo.completed ? "text-green-500" : "text-gray-500 hover:text-purple-500"}`}>
                    {todo.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>
                  <span className={`text-lg ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}>{todo.title}</span>
                </div>
                <button onClick={() => deleteTodo(todo._id)} className="text-red-500 hover:text-red-600 transition-colors">
                  <Trash2 size={20} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
