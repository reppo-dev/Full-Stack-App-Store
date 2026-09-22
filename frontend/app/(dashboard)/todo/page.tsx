"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

const initialTodos: TodoItem[] = [
  { id: 1, text: "Review product listings", completed: false },
  { id: 2, text: "Update inventory records", completed: true },
  { id: 3, text: "Respond to customer tickets", completed: false },
  { id: 4, text: "Prepare monthly report", completed: false },
  { id: 5, text: "Check order fulfillment status", completed: true },
];

export default function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">To-Do List</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-lg">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <Button onClick={addTodo} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                />
                <span
                  className={`flex-1 text-sm ${
                    todo.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {todo.text}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-right">
            {todos.filter((t) => t.completed).length} / {todos.length} completed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
