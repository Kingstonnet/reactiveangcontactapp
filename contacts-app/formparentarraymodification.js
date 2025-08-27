So you want this flow:

Parent sends main array + backup copy to child.

Child makes its own deep copy for the FormGroup.

When child edits, it updates the parent main array (through EventEmitter).

When reset button is clicked, only child’s local form resets to the original backup data, but parent main array should remain unchanged.

Here’s the adjustment 👇

// parent.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    <app-child 
      [data]="mainArray" 
      [backupData]="backupArray"
      (dataChange)="updateData($event)">
    </app-child>

    <pre>Parent main array: {{ mainArray | json }}</pre>
  `
})
export class ParentComponent {
  mainArray = [
    { name: 'Item1', value: 'A' },
    { name: 'Item2', value: 'B' }
  ];

  // Keep a backup copy (deep copy)
  backupArray = JSON.parse(JSON.stringify(this.mainArray));

  updateData(updated: any[]) {
    this.mainArray = updated;  // sync changes from child
  }
}


// child.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-child',
  template: `
    <form [formGroup]="form">
      <div formArrayName="items" *ngFor="let item of formItems.controls; let i = index">
        <div [formGroupName]="i">
          <input formControlName="name" placeholder="Name"/>
          <input formControlName="value" placeholder="Value"/>
        </div>
      </div>
    </form>

    <button (click)="reset()">Reset</button>
    <pre>Child local form: {{ form.value | json }}</pre>
  `
})
export class ChildComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() backupData: any[] = [];
  @Output() dataChange = new EventEmitter<any[]>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  get formItems() {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.createForm(this.data);

    // sync form changes back to parent
    this.form.valueChanges.subscribe(val => {
      this.dataChange.emit(val.items);
    });
  }

  private createForm(source: any[]) {
    const copy = JSON.parse(JSON.stringify(source));
    this.form = this.fb.group({
      items: this.fb.array(copy.map(d => this.fb.group(d)))
    });
  }

  reset() {
    // Reset ONLY child’s local form using backup
    this.createForm(this.backupData);
  }
}
-----------------------------------------------------------------
Perfect 👍 thanks for clarifying.

So what you need is:

Parent keeps the mainArray as source of truth.

Child builds its own deep copy in a FormArray.

Any form change → updates parent array (through @Output).

Reset button → resets only child’s local form back to parent’s array values, but does not overwrite parent’s mainArray.

Here’s the refined solution:

// parent.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    <h2>Parent Array</h2>
    <pre>{{ mainArray | json }}</pre>

    <app-child 
      [data]="mainArray"
      (dataChange)="updateData($event)">
    </app-child>
  `
})
export class ParentComponent {
  mainArray = [
    { name: 'Item1', value: 'A' },
    { name: 'Item2', value: 'B' }
  ];

  updateData(updated: any[]) {
    this.mainArray = updated;  // sync changes from child
  }
}

// child.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-child',
  template: `
    <form [formGroup]="form">
      <div formArrayName="items" *ngFor="let item of formItems.controls; let i = index">
        <div [formGroupName]="i">
          <input formControlName="name" placeholder="Name"/>
          <input formControlName="value" placeholder="Value"/>
        </div>
      </div>
    </form>

    <button type="button" (click)="reset()">Reset (Child Only)</button>
  `
})
export class ChildComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Output() dataChange = new EventEmitter<any[]>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  get formItems() {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      // if parent array changes externally, reset child too
      this.initForm();
    }
  }

  private initForm() {
    const copy = JSON.parse(JSON.stringify(this.data));
    this.form = this.fb.group({
      items: this.fb.array(copy.map(d => this.fb.group(d)))
    });

    // push changes back to parent
    this.form.valueChanges.subscribe(val => {
      this.dataChange.emit(val.items);
    });
  }

  reset() {
    // Just reset child’s local form from parent data
    this.initForm();
  }
}

Yes 💯 — Angular signals (introduced in Angular 16) are perfect for this use-case because they give you reactive state management without needing @Output emitters or complex form subscriptions.

Let me show you how the same logic looks with signals.

Parent Component (with signals)

import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    <app-child 
      [data]="mainArray" 
      [backupData]="backupArray">
    </app-child>

    <pre>Parent main array: {{ mainArray() | json }}</pre>
  `
})
export class ParentComponent {
  // parent main state
  mainArray = signal([
    { name: 'Item1', value: 'A' },
    { name: 'Item2', value: 'B' }
  ]);

  // backup copy (deep clone)
  backupArray = signal(
    JSON.parse(JSON.stringify(this.mainArray()))
  );
}
Child Component (with signals + reactive form)

import { Component, Input, effect, signal, WritableSignal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-child',
  template: `
    <form [formGroup]="form()">
      <div formArrayName="items" *ngFor="let item of formItems().controls; let i = index">
        <div [formGroupName]="i">
          <input formControlName="name" placeholder="Name"/>
          <input formControlName="value" placeholder="Value"/>
        </div>
      </div>
    </form>

    <button (click)="reset()">Reset</button>
    <pre>Child local form: {{ form().value | json }}</pre>
  `
})
export class ChildComponent {
  @Input({ required: true }) data!: WritableSignal<any[]>;       // parent’s main array (signal)
  @Input({ required: true }) backupData!: WritableSignal<any[]>; // parent’s backup array (signal)

  form = signal<FormGroup>(this.fb.group({ items: this.fb.array([]) }));

  constructor(private fb: FormBuilder) {}

  get formItems(): () => FormArray {
    return () => this.form().get('items') as FormArray;
  }

  ngOnInit() {
    this.createForm(this.data());

    // effect: whenever form changes, sync back to parent signal
    effect(() => {
      const val = this.form().value.items;
      if (val) {
        this.data.set(val);   // update parent’s mainArray
      }
    });
  }

  private createForm(source: any[]) {
    const copy = JSON.parse(JSON.stringify(source));
    this.form.set(this.fb.group({
      items: this.fb.array(copy.map(d => this.fb.group(d)))
    }));
  }

  reset() {
    // reset only the child local form
    this.createForm(this.backupData());
    // ❌ do not update parent signal here
  }
}

Got it 👍 — now the situation is:

You have a main array in the parent.

Each child only gets a section (subset) of that main array.

When a child updates its section, that part of the parent’s main array should be updated, but not the whole array.

You’re asking if this works with Angular signals.

Yes ✅ — signals work beautifully for this, and you can manage the state like this:

🔹 Parent Component
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    <!-- Pass each section to its child -->
    <app-child 
      [section]="() => mainArray()[0]" 
      (sectionChange)="updateSection(0, $event)">
    </app-child>

    <app-child 
      [section]="() => mainArray()[1]" 
      (sectionChange)="updateSection(1, $event)">
    </app-child>

    <pre>Parent main array: {{ mainArray() | json }}</pre>
  `
})
export class ParentComponent {
  mainArray = signal([
    { id: 1, name: 'Section 1', value: 'A' },
    { id: 2, name: 'Section 2', value: 'B' }
  ]);

  updateSection(index: number, updated: any) {
    const copy = [...this.mainArray()];
    copy[index] = updated;         // replace only that section
    this.mainArray.set(copy);
  }
}
Child Component (per section)

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-child',
  template: `
    <form [formGroup]="form">
      <input formControlName="name" placeholder="Name"/>
      <input formControlName="value" placeholder="Value"/>
    </form>
    <button (click)="reset()">Reset</button>

    <pre>Child local form: {{ form.value | json }}</pre>
  `
})
export class ChildComponent implements OnInit {
  @Input({ required: true }) section!: () => any;  // signal getter from parent
  @Output() sectionChange = new EventEmitter<any>();

  form!: FormGroup;
  original!: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    const copy = JSON.parse(JSON.stringify(this.section())); // local copy
    this.original = copy;

    this.form = this.fb.group(copy);

    // when form changes, emit update for just this section
    this.form.valueChanges.subscribe(val => {
      this.sectionChange.emit(val);
    });
  }

  reset() {
    // reset only child’s local form (parent remains unchanged)
    this.form.reset(this.original);
  }
}

Parent holds the whole array in a signal.

Each child gets only a section (mainArray()[i]).

When a child updates its form, it emits the change → parent replaces only that section in the main array.

Reset button resets only the child’s local form, not parent’s array.




