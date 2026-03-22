import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Todo {
  id: string;
  content: string;
  isDone: boolean;
  owner?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private baseUrl =
    'https://fm0vjkh041.execute-api.ap-south-1.amazonaws.com/todos';

  constructor(private http: HttpClient) {}

  // ✅ GET
  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.baseUrl);
  }

  // ✅ CREATE
  createTodo(content: string): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, { content });
  }

  // ✅ UPDATE
  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(this.baseUrl, todo);
  }

  // ✅ DELETE
  deleteTodo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
