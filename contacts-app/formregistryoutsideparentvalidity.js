// form-registry.service.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

interface ChildFormEntry {
  form: FormGroup;
  hasMadeChanges: boolean;
}

@Injectable({ providedIn: 'root' })
export class FormRegistryService {
  private childForms: { [key: string]: ChildFormEntry } = {};

  registerForm(key: string, form: FormGroup) {
    this.childForms[key] = { form, hasMadeChanges: false };
  }

  markChanged(key: string) {
    if (this.childForms[key]) {
      this.childForms[key].hasMadeChanges = true;
    }
  }

  getForms() {
    return this.childForms;
  }

  isChildValid(key: string): boolean {
    const entry = this.childForms[key];
    return !!entry && entry.form.valid && entry.hasMadeChanges;
  }

  allValid(): boolean {
    return Object.entries(this.childForms).every(([_, entry]) => 
      entry.form.valid && entry.hasMadeChanges
    );
  }
}

// child.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormRegistryService } from '../form-registry.service';

@Component({
  selector: 'app-child',
  template: `
    <form [formGroup]="childForm">
      <input formControlName="name" placeholder="Name" />
      <button type="button" (click)="markAsChanged()">Make Changes</button>
    </form>
    <p *ngIf="!childForm.valid">Form invalid (local check)</p>
  `
})
export class ChildComponent implements OnInit {
  @Input() formKey!: string;

  childForm = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  constructor(private formRegistry: FormRegistryService) {}

  ngOnInit() {
    this.formRegistry.registerForm(this.formKey, this.childForm);
  }

  markAsChanged() {
    this.formRegistry.markChanged(this.formKey);
  }
}


// parent.component.ts
import { Component } from '@angular/core';
import { FormRegistryService } from '../form-registry.service';

@Component({
  selector: 'app-parent',
  template: `
    <app-child *ngFor="let section of sections" [formKey]="section.id"></app-child>

    <button (click)="checkValidity()">Check All</button>
  `
})
export class ParentComponent {
  sections = [
    { id: 'child1' },
    { id: 'child2' }
  ];

  constructor(private formRegistry: FormRegistryService) {}

  checkValidity() {
    const forms = this.formRegistry.getForms();
    for (const [key, entry] of Object.entries(forms)) {
      console.log(
        `Child ${key} valid locally:`, entry.form.valid,
        ` | made changes:`, entry.hasMadeChanges,
        ` | valid for parent:`, this.formRegistry.isChildValid(key)
      );
    }

    console.log('All valid for parent?', this.formRegistry.allValid());
  }
}

/*
ecords older than 2 days (effective date ≤ 2 days ago)
SELECT *
FROM your_table
WHERE effectivedate <= TRUNC(SYSDATE) - 2;


➡️ This gives rows where effectivedate is on or before 2 days ago.

2️⃣ Records within the last 2 days (recent records)
SELECT *
FROM your_table
WHERE effectivedate >= TRUNC(SYSDATE) - 2;
*/