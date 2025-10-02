import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Item {  // Replace with your actual API response interface
  id: number;
  name: string;
  value: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  myForm: FormGroup;
  items: Item[] = [];  // Store API data

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Initialize the form with an empty FormArray
    this.myForm = this.fb.group({
      itemsArray: this.fb.array([])  // FormArray for dynamic items
    });
  }

  ngOnInit() {
    this.fetchDataFromApi();
  }

  // Fetch data from API (replace 'your-api-endpoint' with actual URL)
  fetchDataFromApi() {
    this.http.get<Item[]>('your-api-endpoint').subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.populateFormArray(data);  // Assign values to FormArray
      },
      error: (error) => {
        console.error('API error:', error);
      }
    });
  }

  // Getter for easier access to FormArray in template
  get itemsArray(): FormArray {
    return this.myForm.get('itemsArray') as FormArray;
  }

  // Populate FormArray with API data
  populateFormArray(data: Item[]) {
    // Clear existing controls
    while (this.itemsArray.length !== 0) {
      this.itemsArray.removeAt(0);
    }

    // Add a FormGroup for each item
    data.forEach(item => {
      const itemGroup = this.fb.group({
        id: [item.id, Validators.required],
        name: [item.name, Validators.required],
        value: [item.value, Validators.required]
      });
      this.itemsArray.push(itemGroup);
    });
  }

  // Optional: Method to add a new empty item (for dynamic addition)
  addItem() {
    const newItem = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      value: [0, Validators.required]
    });
    this.itemsArray.push(newItem);
  }

  // Submit form (example)
  onSubmit() {
    if (this.myForm.valid) {
      console.log('Form Value:', this.myForm.value);
      // Send to API: this.http.post('submit-endpoint', this.myForm.value).subscribe();
    }
  }
}


<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <div formArrayName="itemsArray">
    <div *ngFor="let item of itemsArray.controls; let i = index" [formGroupName]="i">
      <h3>Item {{ i + 1 }}</h3>
      <input type="number" formControlName="id" placeholder="ID" />
      <input type="text" formControlName="name" placeholder="Name" />
      <input type="number" formControlName="value" placeholder="Value" />
      
      <!-- Validation feedback example -->
      <div *ngIf="item.get('name')?.invalid && item.get('name')?.touched">
        Name is required.
      </div>
    </div>
  </div>
  
  <button type="button" (click)="addItem()">Add Item</button>
  <button type="submit" [disabled]="myForm.invalid">Submit</button>
</form>

<!-- Debug: Show raw form value -->
<pre>{{ myForm.value | json }}</pre>

Async Population: If the API is slow, the form renders empty first—use Angular's OnPush change detection if needed, or add a loading spinner.
