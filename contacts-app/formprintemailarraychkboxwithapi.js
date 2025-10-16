import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  addressesForm: FormArray;

  constructor(private fb: FormBuilder) {
    this.addressesForm = this.fb.array([]);
  }

  ngOnInit() {
    // Example: mock API call to load addresses
    const apiResponse = [
      {
        print: true,
        email: true,
        address: {
          addressLine1: '123 Main St',
          addressLine2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
        },
        emails: ['john@example.com', 'info@example.com'],
      },
      {
        print: false,
        email: true,
        address: {
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
        },
        emails: ['support@example.com'],
      },
    ];

    this.loadAddressesFromApi(apiResponse);
  }

  // Load API data into the FormArray
  loadAddressesFromApi(addressList: any[]) {
    this.addressesForm.clear();
    addressList.forEach((addr) => {
      const group = this.newAddressGroup();

      group.patchValue({
        print: addr.print,
        email: addr.email,
        address: addr.address,
      });

      // Fill emails array
      const emailsArray = group.get('emails') as FormArray;
      addr.emails.forEach((email: string) => {
        emailsArray.push(new FormControl(email, [Validators.required, Validators.email]));
      });

      // You can set completed true if you want them read-only
      // Example: if API returns already completed records
      // group.get('completed')?.setValue(true);
      // group.disable();

      this.addressesForm.push(group);
    });
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

    <label>
      <input type="checkbox" formControlName="print" /> Print
    </label>
    <label>
      <input type="checkbox" formControlName="email" /> Email
    </label>

    <div *ngIf="addressGroup.get('print')?.value" formGroupName="address">
      <input formControlName="addressLine1" placeholder="Address Line 1" />
      <input formControlName="addressLine2" placeholder="Address Line 2" />
      <input formControlName="city" placeholder="City" />
      <input formControlName="state" placeholder="State" />
      <input formControlName="postalCode" placeholder="Postal Code" />
      <input formControlName="country" placeholder="Country" />
    </div>

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


