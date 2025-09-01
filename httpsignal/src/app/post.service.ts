import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Post } from './post.model';
import { environment } from '../environments/environment';
import { SKIP_AUTH } from './auth.interceptor';

@Injectable({ providedIn: 'root' })
export class PostService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {

  }

  fetchPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/posts`).pipe(
      retry({ count: 3, delay: (error, count) => timer(1000 * count) }),
      catchError(this.handleError)
    );
  }

  createPost(post: Post): Observable<Post> {
    return this.http.post<Post>(
      `${this.apiUrl}/posts`,
      post,
      { context: new HttpContext().set(SKIP_AUTH, 'SKIP_AUTH') }
    ).pipe(catchError(this.handleError));
  }

  updatePost(post: Post): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/posts/${post.id}`, post).pipe(catchError(this.handleError));
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`).pipe(catchError(this.handleError));
  }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}