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
    // Example mock API data
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

  // Load API data
  loadAddressesFromApi(addressList: any[]) {
    this.addressesForm.clear();
    addressList.forEach((addr) => {
      const group = this.newAddressGroup();

      group.patchValue({
        print: addr.print,
        email: addr.email,
        address: addr.address,
      });

      // fill emails
      const emailsArray = group.get('emails') as FormArray;
      addr.emails.forEach((email: string) => {
        emailsArray.push(new FormControl(email, [Validators.required, Validators.email]));
      });

      this.addressesForm.push(group);
    });
  }

  // Create new address form group
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

  // Remove an address section
  removeAddress(index: number) {
    const confirmDelete = confirm('Are you sure you want to remove this address?');
    if (confirmDelete) {
      this.addressesForm.removeAt(index);
    }
  }

  // Add a new email field
  addEmail(addressIndex: number) {
    const emails = this.getEmails(addressIndex);
    emails.push(new FormControl('', [Validators.required, Validators.email]));
  }

  getEmails(addressIndex: number): FormArray {
    return this.addressesForm.at(addressIndex).get('emails') as FormArray;
  }

  completeAddress(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;

    if (group.get('print')?.value) group.get('address')?.markAllAsTouched();
    if (group.get('email')?.value) group.get('emails')?.markAllAsTouched();

    if (group.valid) {
      group.get('completed')?.setValue(true);
      group.disable();
    } else {
      alert('Please fill all required fields correctly.');
    }
  }

  editAddress(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;
    group.enable();
    group.get('completed')?.setValue(false);
  }
}

<div class="container">
  <button (click)="addAddress()">Add Address</button>

  @for (addressGroup of addressesForm.controls; track $index; let i = $index) {
    <div [formGroup]="addressGroup" class="address-card">
      <h3>Address {{ i + 1 }}</h3>

      <label>
        <input type="checkbox" formControlName="print" /> Print
      </label>
      <label>
        <input type="checkbox" formControlName="email" /> Email
      </label>

      <!-- Address Section -->
      @if (addressGroup.get('print')?.value) {
        <div formGroupName="address">
          <input formControlName="addressLine1" placeholder="Address Line 1" />
          <input formControlName="addressLine2" placeholder="Address Line 2" />
          <input formControlName="city" placeholder="City" />
          <input formControlName="state" placeholder="State" />
          <input formControlName="postalCode" placeholder="Postal Code" />
          <input formControlName="country" placeholder="Country" />
        </div>
      }

      <!-- Email Section -->
      @if (addressGroup.get('email')?.value) {
        <div formArrayName="emails">
          @for (emailCtrl of getEmails(i).controls; track $index; let j = $index) {
            <input [formControlName]="j" placeholder="Enter email" />
          }
        </div>

        @if (!addressGroup.get('completed')?.value) {
          <button type="button" (click)="addEmail(i)">Add Email</button>
        }
      }

      <!-- Buttons Section -->
      <div class="buttons">
        @if (!addressGroup.get('completed')?.value) {
          <button type="button" (click)="completeAddress(i)">Complete</button>
        } @else {
          <button type="button" (click)="editAddress(i)">Edit</button>
        }

        <button type="button" (click)="removeAddress(i)" class="remove-btn">Remove</button>
      </div>

      <hr />
    </div>
  }
</div>
.container {
  padding: 20px;
}

.address-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
  background: #fafafa;
}

input {
  display: block;
  margin: 5px 0;
  width: 250px;
}

.buttons {
  margin-top: 10px;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  margin-left: 10px;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
}

.remove-btn:hover {
  background-color: #c0392b;
}

