Passing event approach:-
-----------------------------------

// child.component.ts
@Component({
  selector: 'app-child',
  template: `
    <form [formGroup]="childForm">
      <!-- your form fields -->
      <input formControlName="name" placeholder="Name" />

      <button type="button" (click)="markAsChanged()">Make Changes</button>
    </form>
  `
})
export class ChildComponent {
  @Input() data: any;
  @Output() formReady = new EventEmitter<FormGroup>();

  childForm = new FormGroup({
    name: new FormControl('', Validators.required),
    hasMadeChanges: new FormControl(false, Validators.requiredTrue) // 👈 must be true
  });

  ngOnInit() {
    this.formReady.emit(this.childForm); // send form to parent
  }

  markAsChanged() {
    this.childForm.get('hasMadeChanges')?.setValue(true);
  }
}


// parent.component.ts
@Component({
  selector: 'app-parent',
  template: `
    <app-child
      *ngFor="let section of sections; let i = index"
      [data]="section"
      (formReady)="registerChildForm($event, i)">
    </app-child>

    <button (click)="checkValidity()">Check All</button>
  `
})
export class ParentComponent {
  childForms: { [key: number]: FormGroup } = {};

  sections = [
    { id: 1, name: '' },
    { id: 2, name: '' }
  ];

  registerChildForm(form: FormGroup, index: number) {
    this.childForms[index] = form;
  }

  checkValidity() {
    Object.entries(this.childForms).forEach(([idx, form]) => {
      console.log(`Child ${idx} valid:`, form.valid);
    });
  }
}

if (!form.valid) {
  console.log(`Child ${idx} is invalid`);
}
===============================================================================
By service.

// form-registry.service.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class FormRegistryService {
  private childForms: { [key: string]: FormGroup } = {};

  registerForm(key: string, form: FormGroup) {
    this.childForms[key] = form;
  }

  getForms() {
    return this.childForms;
  }

  getForm(key: string): FormGroup | undefined {
    return this.childForms[key];
  }

  allValid(): boolean {
    return Object.values(this.childForms).every(f => f.valid);
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
  `
})
export class ChildComponent implements OnInit {
  @Input() formKey!: string; // 👈 unique key for parent to identify

  childForm = new FormGroup({
    name: new FormControl('', Validators.required),
    hasMadeChanges: new FormControl(false, Validators.requiredTrue)
  });

  constructor(private formRegistry: FormRegistryService) {}

  ngOnInit() {
    this.formRegistry.registerForm(this.formKey, this.childForm);
  }

  markAsChanged() {
    this.childForm.get('hasMadeChanges')?.setValue(true);
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
    for (const [key, form] of Object.entries(forms)) {
      console.log(`Child ${key} valid:`, form.valid);
    }

    console.log('All valid?', this.formRegistry.allValid());
  }
}
