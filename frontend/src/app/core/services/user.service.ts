import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUsersInOrganization(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/organization`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  updateUserRole(id: string, role: Role): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/role`, { role });
  }
}
