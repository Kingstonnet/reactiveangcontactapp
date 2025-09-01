
import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { PostService } from './post.service';
import { Post } from './post.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  posts!: Signal<Post[]>;
  error = signal<string | null>(null);

  postForm!: FormGroup

  constructor(
    private postService: PostService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar
  ) {
    this.postForm = this.fb.group({
      id: [0],
      title: ['', Validators.required],
      body: ['', Validators.required],
      userId: [1]
    });

    this.posts = toSignal(
      this.postService.fetchPosts().pipe(
        catchError((error: Error) => {
          this.error.set(error.message)
          return of([])
        })
      ),
      {initialValue: []}
    );
  }

  editPost(post: Post) {
    this.postForm.setValue(post);
  }

  onSubmit() {
    if (this.postForm.valid) {
      const post = this.postForm.value as Post;
      if (post.id === 0) {
        this.postService.createPost(post).subscribe({
          next: () => {
            this.posts = toSignal(this.postService.fetchPosts(), { initialValue: [] });
          },
          error: (err: Error) => {
            this.error.set(err.message);
            this.snackbar.open(err.message, 'Close', { duration: 10000 });
          }
      });
      } else {
        this.postService.updatePost(post).subscribe(() => {
          this.posts = toSignal(this.postService.fetchPosts(), { initialValue: [] });
        });
      }
      this.postForm.reset({ id: 0, userId: 1 });
    }
  }

  // Clip 3: Deleting Resources with DELETE (Demo: Delete post)
  deletePost(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(id).subscribe(() => {
        this.posts = toSignal(this.postService.fetchPosts(), { initialValue: [] });
      });
    }
  }

}
