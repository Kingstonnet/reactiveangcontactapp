import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  addressForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      addresses: this.fb.array([]),
    });
  }

  get addresses(): FormArray {
    return this.addressForm.get('addresses') as FormArray;
  }

  private createAddressGroup(): FormGroup {
    return this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  addAddress() {
    // If no addresses yet, create the first one
    if (this.addresses.length === 0) {
      this.addresses.push(this.createAddressGroup());
      return;
    }

    // Check if the last address form is valid before adding another
    const lastAddress = this.addresses.at(this.addresses.length - 1);
    if (lastAddress.valid) {
      this.addresses.push(this.createAddressGroup());
    } else {
      lastAddress.markAllAsTouched(); // show validation errors
      alert('Please complete the current address before adding another.');
    }
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  onSubmit() {
    if (this.addressForm.valid) {
      console.log('Submitted Addresses:', this.addressForm.value);
      alert('All addresses submitted successfully!');
    } else {
      this.addressForm.markAllAsTouched();
    }
  }
}

<div class="container">
  <h2>Address Form (Reactive)</h2>

  <button type="button" (click)="addAddress()">+ Add Address</button>

  <form [formGroup]="addressForm" (ngSubmit)="onSubmit()">
    <div formArrayName="addresses">
      <div
        *ngFor="let address of addresses.controls; let i = index"
        [formGroupName]="i"
        class="address-card"
      >
        <h3>Address {{ i + 1 }}</h3>

        <label>Address Line 1:</label>
        <input formControlName="addressLine1" />
        <div *ngIf="address.get('addressLine1')?.touched && address.get('addressLine1')?.invalid">
          <small class="error">Address Line 1 is required</small>
        </div>

        <label>Address Line 2:</label>
        <input formControlName="addressLine2" />
        <div *ngIf="address.get('addressLine2')?.touched && address.get('addressLine2')?.invalid">
          <small class="error">Address Line 2 is required</small>
        </div>

        <label>City:</label>
        <input formControlName="city" />
        <div *ngIf="address.get('city')?.touched && address.get('city')?.invalid">
          <small class="error">City is required</small>
        </div>

        <label>State:</label>
        <input formControlName="state" />
        <div *ngIf="address.get('state')?.touched && address.get('state')?.invalid">
          <small class="error">State is required</small>
        </div>

        <label>Postal Code:</label>
        <input formControlName="postalCode" />
        <div *ngIf="address.get('postalCode')?.touched && address.get('postalCode')?.invalid">
          <small class="error">Postal Code is required</small>
        </div>

        <label>Country:</label>
        <input formControlName="country" />
        <div *ngIf="address.get('country')?.touched && address.get('country')?.invalid">
          <small class="error">Country is required</small>
        </div>

        <button type="button" (click)="removeAddress(i)">Remove</button>
        <hr />
      </div>
    </div>

    <button type="submit" [disabled]="addresses.length === 0">Submit</button>
  </form>
</div>

