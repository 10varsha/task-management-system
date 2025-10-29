import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/users';
  
  users = signal<User[]>([]);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  getUsersInOrganization(): Observable<User[]> {
    this.loading.set(true);
    return this.http.get<User[]>(`${this.API_URL}/organization`).pipe(
      tap(users => {
        this.users.set(users);
        this.loading.set(false);
      })
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  updateUserRole(id: string, role: Role): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/role`, { role }).pipe(
      tap(updatedUser => {
        this.users.update(users =>
          users.map(u => u.id === id ? updatedUser : u)
        );
      })
    );
  }
}
