import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoService } from '../services/todo.service';
@Component({
  selector: 'app-todos',
  imports: [CommonModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent implements OnInit {
  todos: any[] = [];

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos() {
    this.todoService.getTodos().subscribe({
      next: (data) => (this.todos = data),
      error: (err) => console.error(err),
    });
  }

  createTodo() {
    const content = window.prompt('Todo content');
    if (!content) return;

    this.todoService.createTodo(content).subscribe(() => {
      this.loadTodos();
    });
  }

  deleteTodo(id: string) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.loadTodos();
    });
  }
  toggleTodo(todo: any) {
    const updated = {
      ...todo,
      isDone: !todo.isDone,
    };

    this.todoService.updateTodo(updated).subscribe(() => {
      this.loadTodos();
    });
  }

  editTodo(todo: any) {
    const content = window.prompt('Edit todo', todo.content);
    if (!content) return;

    const updated = { ...todo, content };

    this.todoService.updateTodo(updated).subscribe(() => {
      this.loadTodos();
    });
  }
}
