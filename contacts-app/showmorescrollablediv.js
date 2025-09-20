import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
})
export class RecordListComponent {
  allRecords: any[] = [];
  step = 500;
  visibleCount = this.step;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    // Dummy data (replace with API data)
    this.allRecords = Array.from({ length: 5000 }, (_, i) => `Record ${i + 1}`);
  }

  get visibleRecords() {
    return this.allRecords.slice(0, this.visibleCount);
  }

  showMore() {
    const oldCount = this.visibleCount;
    this.visibleCount = Math.min(this.visibleCount + this.step, this.allRecords.length);

    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      const newItem = container.querySelectorAll('li')[oldCount] as HTMLElement;
      if (newItem) {
        container.scrollTo({ top: newItem.offsetTop, behavior: 'smooth' });
      }
    });
  }

  showLess() {
    this.visibleCount = Math.max(this.visibleCount - this.step, this.step);

    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  showAll() {
    this.visibleCount = this.allRecords.length;

    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });
  }

  reset() {
    this.visibleCount = this.step;

    setTimeout(() => {
      const container = this.scrollContainer.nativeElement;
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}


<div #scrollContainer class="scroll-box">
  <ul>
    @for (record of visibleRecords; track record) {
      <li>{{ record }}</li>
    }
  </ul>
</div>

<div class="actions">
  <button *ngIf="visibleCount < allRecords.length" (click)="showMore()">Show More</button>
  <button *ngIf="visibleCount > step" (click)="showLess()">Show Less</button>
  <button *ngIf="visibleCount < allRecords.length" (click)="showAll()">Show All</button>
  <button *ngIf="visibleCount > step" (click)="reset()">Show First {{ step }}</button>
</div>


.scroll-box {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 0.5rem;
}
