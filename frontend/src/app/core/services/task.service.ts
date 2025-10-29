import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:3000/tasks';

  tasks = signal<Task[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  loadTasks(): Observable<Task[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<Task[]>(this.API_URL).pipe(
      tap(tasks => {
        this.tasks.set(tasks);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Failed to load tasks');
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.API_URL, task).pipe(
      tap(newTask => {
        this.tasks.update(tasks => [...tasks, newTask]);
      })
    );
  }

  updateTask(id: string, task: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${id}`, task).pipe(
      tap(updatedTask => {
        this.tasks.update(tasks =>
          tasks.map(t => t.id === id ? updatedTask : t)
        );
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.tasks.update(tasks => tasks.filter(t => t.id !== id));
      })
    );
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks().filter(task => task.status === status);
  }

  getTaskStats() {
    const allTasks = this.tasks();
    return {
      total: allTasks.length,
      todo: allTasks.filter(t => t.status === TaskStatus.TODO).length,
      inProgress: allTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: allTasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    };
  }
}
