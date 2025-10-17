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
  viewMode = true; // overall view or edit mode

  constructor(private fb: FormBuilder) {
    this.addressesForm = this.fb.array([]);
  }

  ngOnInit() {
    // Simulated API data
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

  // 🧱 Create a new form group
  newAddressGroup(): FormGroup {
    const group = this.fb.group({
      print: [false],
      email: [false],
      completed: [false],
      editing: [false],
      address: this.fb.group({
        addressLine1: [''],
        addressLine2: [''],
        city: [''],
        state: [''],
        postalCode: [''],
        country: [''],
      }),
      emails: this.fb.array([]),
    });

    // watch for checkbox changes to update validators dynamically
    group.get('print')?.valueChanges.subscribe(() => this.updateValidators(group));
    group.get('email')?.valueChanges.subscribe(() => this.updateValidators(group));

    return group;
  }

  // 🧠 Dynamically update validators based on checkbox states
  updateValidators(group: FormGroup) {
    const print = group.get('print')?.value;
    const email = group.get('email')?.value;
    const addressGroup = group.get('address') as FormGroup;
    const emailsArray = group.get('emails') as FormArray;

    // Reset all validators first
    Object.keys(addressGroup.controls).forEach((key) => {
      addressGroup.get(key)?.clearValidators();
      addressGroup.get(key)?.updateValueAndValidity({ emitEvent: false });
    });

    emailsArray.controls.forEach((ctrl) => {
      ctrl.clearValidators();
      ctrl.updateValueAndValidity({ emitEvent: false });
    });

    // Apply required validators conditionally
    if (print) {
      Object.keys(addressGroup.controls).forEach((key) => {
        addressGroup.get(key)?.setValidators(Validators.required);
        addressGroup.get(key)?.updateValueAndValidity({ emitEvent: false });
      });
    }

    if (email) {
      emailsArray.controls.forEach((ctrl) => {
        ctrl.setValidators([Validators.required, Validators.email]);
        ctrl.updateValueAndValidity({ emitEvent: false });
      });
    }
  }

  // 🧩 Load from API
  loadAddressesFromApi(addressList: any[]) {
    this.addressesForm.clear();
    addressList.forEach((addr) => {
      const group = this.newAddressGroup();

      group.patchValue({
        print: addr.print,
        email: addr.email,
        address: addr.address,
      });

      const emailsArray = group.get('emails') as FormArray;
      addr.emails.forEach((email: string) => {
        emailsArray.push(new FormControl(email, [Validators.required, Validators.email]));
      });

      this.updateValidators(group); // initialize validation rules

      group.get('completed')?.setValue(true);
      group.disable();
      this.addressesForm.push(group);
    });
  }

  // 🧱 Add/Remove Addresses
  addAddress() {
    const group = this.newAddressGroup();
    this.addressesForm.push(group);
    this.viewMode = false;
    group.get('editing')?.setValue(true);
  }

  removeAddress(index: number) {
    const confirmDelete = confirm('Remove this address section?');
    if (confirmDelete) {
      this.addressesForm.removeAt(index);
    }
  }

  // 🧠 Email handling
  getEmails(addressIndex: number): FormArray {
    return this.addressesForm.at(addressIndex).get('emails') as FormArray;
  }

  addEmail(addressIndex: number) {
    const emails = this.getEmails(addressIndex);
    const newEmailCtrl = new FormControl('', [Validators.required, Validators.email]);
    emails.push(newEmailCtrl);
    const group = this.addressesForm.at(addressIndex) as FormGroup;
    this.updateValidators(group); // reapply validation after new email added
  }

  // 🧩 Section control actions
  editSection(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;
    group.enable();
    group.get('editing')?.setValue(true);
  }

  completeSection(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;

    const print = group.get('print')?.value;
    const email = group.get('email')?.value;

    if (!print && !email) {
      alert('Select at least Print or Email.');
      return;
    }

    this.updateValidators(group);

    group.markAllAsTouched();
    if (group.valid) {
      group.get('completed')?.setValue(true);
      group.get('editing')?.setValue(false);
      group.disable();
    } else {
      alert('Please fill all required fields correctly.');
    }
  }

  // 🧩 Final Save + Edit
  saveAll() {
    this.viewMode = true;
    this.addressesForm.disable();
    this.addressesForm.controls.forEach((g) => g.get('editing')?.setValue(false));
    const finalData = this.addressesForm.getRawValue();
    console.log('Saving to API:', finalData);
    alert('Data saved successfully (check console).');
  }

  editAll() {
    this.viewMode = false;
    this.addressesForm.disable(); // keep view-only until per-section edit
  }
}


<div class="container">
  <h2>Address Management</h2>

  <button type="button" (click)="addAddress()">Add Address</button>
  <button type="button" (click)="editAll()">Final Edit</button>
  <button type="button" (click)="saveAll()">Final Save</button>

  <div class="addresses">
    @for (addressGroup of addressesForm.controls; track $index) {
      <div class="card" [class.disabled]="addressGroup.disabled">
        <div class="card-header">
          <h3>Address Section {{ $index + 1 }}</h3>
          @if (!addressGroup.get('editing')?.value) {
            <button type="button" (click)="editSection($index)">✏️ Edit</button>
          }
          <button type="button" (click)="removeAddress($index)">🗑 Remove</button>
        </div>

        <div class="options">
          <label>
            <input type="checkbox" [formControl]="addressGroup.get('print')" /> Print
          </label>
          <label>
            <input type="checkbox" [formControl]="addressGroup.get('email')" /> Email
          </label>
        </div>

        @if (addressGroup.get('print')?.value) {
          <div class="address-fields">
            <h4>Address Details</h4>

            <div class="form-group">
              <label>Address Line 1</label>
              <input type="text" [formControl]="addressGroup.get('address.addressLine1')" />
              @if (addressGroup.get('address.addressLine1')?.touched && addressGroup.get('address.addressLine1')?.invalid) {
                <div class="error">Address Line 1 is required</div>
              }
            </div>

            <div class="form-group">
              <label>Address Line 2</label>
              <input type="text" [formControl]="addressGroup.get('address.addressLine2')" />
              @if (addressGroup.get('address.addressLine2')?.touched && addressGroup.get('address.addressLine2')?.invalid) {
                <div class="error">Address Line 2 is required</div>
              }
            </div>

            <div class="form-group">
              <label>City</label>
              <input type="text" [formControl]="addressGroup.get('address.city')" />
              @if (addressGroup.get('address.city')?.touched && addressGroup.get('address.city')?.invalid) {
                <div class="error">City is required</div>
              }
            </div>

            <div class="form-group">
              <label>State</label>
              <input type="text" [formControl]="addressGroup.get('address.state')" />
              @if (addressGroup.get('address.state')?.touched && addressGroup.get('address.state')?.invalid) {
                <div class="error">State is required</div>
              }
            </div>

            <div class="form-group">
              <label>Postal Code</label>
              <input type="text" [formControl]="addressGroup.get('address.postalCode')" />
              @if (addressGroup.get('address.postalCode')?.touched && addressGroup.get('address.postalCode')?.invalid) {
                <div class="error">Postal Code is required</div>
              }
            </div>

            <div class="form-group">
              <label>Country</label>
              <input type="text" [formControl]="addressGroup.get('address.country')" />
              @if (addressGroup.get('address.country')?.touched && addressGroup.get('address.country')?.invalid) {
                <div class="error">Country is required</div>
              }
            </div>
          </div>
        }

        @if (addressGroup.get('email')?.value) {
          <div class="email-section">
            <h4>Email Addresses</h4>

            @for (emailCtrl of getEmails($index).controls; track emailIndex) {
              <div class="form-group">
                <input type="email" [formControl]="emailCtrl" placeholder="Enter email" />
                @if (emailCtrl.touched && emailCtrl.invalid) {
                  <div class="error">
                    @if (emailCtrl.errors?.['required']) { Email is required. }
                    @if (emailCtrl.errors?.['email']) { Invalid email format. }
                  </div>
                }
              </div>
            }

            <button type="button" (click)="addEmail($index)">+ Add Email</button>
          </div>
        }

        @if (addressGroup.get('editing')?.value) {
          <button type="button" (click)="completeSection($index)">Complete</button>
        }
      </div>
    }
  </div>
</div>


.container {
  max-width: 800px;
  margin: 2rem auto;
  font-family: Arial, sans-serif;
}

button {
  margin-right: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: #1976d2;
  color: white;
  cursor: pointer;
}

button:hover {
  background: #1565c0;
}

.card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 10px;
  background: #f9f9f9;
}

.card.disabled {
  opacity: 0.7;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
}

input[type='text'],
input[type='email'] {
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #aaa;
}

.error {
  color: #e53935;
  font-size: 0.8rem;
  margin-top: 2px;
}

.address-fields,
.email-section {
  margin-left: 1.5rem;
  margin-top: 1rem;
}

.options {
  margin-bottom: 1rem;
}

h4 {
  margin-bottom: 0.5rem;
  color: #333;
}

