import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://api.example.com'; // Your backend

  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true  // 👈 this allows cookies/session tokens
  };

  constructor(private http: HttpClient) {}

  getData(endpoint: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${endpoint}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  postData(endpoint: string, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, payload, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // ... same for PUT, DELETE
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error (${error.status}): ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}


import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-user',
  template: `
    <div *ngIf="error">{{ error }}</div>
    <ul *ngIf="users">
      <li *ngFor="let user of users">{{ user.name }}</li>
    </ul>
  `
})
export class UserComponent implements OnInit {
  users: any[] = [];
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getData('users').subscribe({
      next: (data) => this.users = data,
      error: (err) => this.error = err
    });
  }
}

//https://github.com/juristr/egghead-learn-http-in-angular
