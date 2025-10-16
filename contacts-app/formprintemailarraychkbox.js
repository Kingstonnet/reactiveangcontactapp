import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  addressesForm: FormArray;

  constructor(private fb: FormBuilder) {
    this.addressesForm = this.fb.array([]);
  }

  // Create a new address form group
  newAddressGroup(): FormGroup {
    return this.fb.group({
      print: [false],
      email: [false],
      completed: [false],
      address: this.fb.group({
        addressLine1: ['', Validators.required],
        addressLine2: [''],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required],
      }),
      emails: this.fb.array([]),
    });
  }

  // Add new address section
  addAddress() {
    this.addressesForm.push(this.newAddressGroup());
  }

  // Add a new email field to a specific address
  addEmail(addressIndex: number) {
    const emails = this.getEmails(addressIndex);
    emails.push(new FormControl('', [Validators.required, Validators.email]));
  }

  // Get emails FormArray
  getEmails(addressIndex: number): FormArray {
    return this.addressesForm.at(addressIndex).get('emails') as FormArray;
  }

  // Get address form group
  getAddressGroup(addressIndex: number): FormGroup {
    return this.addressesForm.at(addressIndex).get('address') as FormGroup;
  }

  // Complete the address
  completeAddress(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;

    // Validate based on selections
    if (group.get('print')?.value) {
      group.get('address')?.markAllAsTouched();
    }
    if (group.get('email')?.value) {
      group.get('emails')?.markAllAsTouched();
    }

    if (group.valid) {
      group.get('completed')?.setValue(true);
      group.disable(); // make it read-only
    } else {
      alert('Please fill all required fields correctly.');
    }
  }

  // Edit existing completed address
  editAddress(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;
    group.enable();
    group.get('completed')?.setValue(false);
  }
}

<div class="container">
  <button (click)="addAddress()">Add Address</button>

  <div
    *ngFor="let addressGroup of addressesForm.controls; let i = index"
    [formGroup]="addressGroup"
    class="address-card"
  >
    <h3>Address {{ i + 1 }}</h3>

    <!-- Print & Email checkboxes -->
    <label>
      <input type="checkbox" formControlName="print" /> Print
    </label>
    <label>
      <input type="checkbox" formControlName="email" /> Email
    </label>

    <!-- Address Section -->
    <div *ngIf="addressGroup.get('print')?.value" formGroupName="address">
      <input formControlName="addressLine1" placeholder="Address Line 1" />
      <input formControlName="addressLine2" placeholder="Address Line 2" />
      <input formControlName="city" placeholder="City" />
      <input formControlName="state" placeholder="State" />
      <input formControlName="postalCode" placeholder="Postal Code" />
      <input formControlName="country" placeholder="Country" />
    </div>

    <!-- Email Section -->
    <div *ngIf="addressGroup.get('email')?.value">
      <div formArrayName="emails">
        <div *ngFor="let emailCtrl of getEmails(i).controls; let j = index">
          <input [formControlName]="j" placeholder="Enter email" />
        </div>
      </div>
      <button type="button" (click)="addEmail(i)" *ngIf="!addressGroup.get('completed')?.value">
        Add Email
      </button>
    </div>

    <!-- Complete / Edit Buttons -->
    <div class="buttons">
      <button type="button" (click)="completeAddress(i)" *ngIf="!addressGroup.get('completed')?.value">
        Complete
      </button>
      <button type="button" (click)="editAddress(i)" *ngIf="addressGroup.get('completed')?.value">
        Edit
      </button>
    </div>

    <hr />
  </div>
</div>


.container {
  padding: 20px;
}

.address-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
}

input {
  display: block;
  margin: 5px 0;
  width: 250px;
}

.buttons {
  margin-top: 10px;
}
