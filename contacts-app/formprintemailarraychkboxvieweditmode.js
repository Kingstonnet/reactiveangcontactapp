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
    // Mock API data
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

  // Load API data and initialize form
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
      addr.emails.forEach((email: string) =>
        emailsArray.push(new FormControl(email, [Validators.required, Validators.email]))
      );
      group.get('completed')?.setValue(true);
      group.disable();
      this.addressesForm.push(group);
    });
  }

  // Create a new address section
  newAddressGroup(): FormGroup {
    return this.fb.group({
      print: [false],
      email: [false],
      completed: [false],
      editing: [false],
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

  // Email handling
  getEmails(addressIndex: number): FormArray {
    return this.addressesForm.at(addressIndex).get('emails') as FormArray;
  }

  addEmail(addressIndex: number) {
    const emails = this.getEmails(addressIndex);
    emails.push(new FormControl('', [Validators.required, Validators.email]));
  }

  // Section control actions
  editSection(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;
    group.enable();
    group.get('editing')?.setValue(true);
  }

  completeSection(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;
    if (group.get('print')?.value) group.get('address')?.markAllAsTouched();
    if (group.get('email')?.value) group.get('emails')?.markAllAsTouched();

    if (group.valid) {
      group.get('completed')?.setValue(true);
      group.get('editing')?.setValue(false);
      group.disable();
    } else {
      alert('Please fill all required fields correctly.');
    }
  }

  // Final Save + Edit
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
    this.addressesForm.disable(); // keep sections in view until individually edited
  }
}

<div class="container">
  <div class="toolbar">
    @if (viewMode) {
      <button (click)="editAll()">Edit</button>
    } @else {
      <button (click)="saveAll()">Save</button>
      <button (click)="addAddress()">Add Address</button>
    }
  </div>

  @for (addressGroup of addressesForm.controls; track $index; let i = $index) {
    <div class="address-card" [formGroup]="addressGroup">
      <div class="header">
        <h3>Address {{ i + 1 }}</h3>

        @if (viewMode && addressGroup.get('completed')?.value) {
          <button class="icon-btn" disabled title="Locked">🔒</button>
        } @else if (!addressGroup.get('editing')?.value) {
          <button
            class="icon-btn"
            (click)="editSection(i)"
            [disabled]="viewMode"
            title="Edit Section"
          >
            ✏️
          </button>
        }
      </div>

      @if (!addressGroup.get('editing')?.value) {
        <!-- VIEW MODE -->
        <div class="view-section">
          @if (addressGroup.get('print')?.value) {
            <div>
              <strong>Address:</strong><br />
              {{ addressGroup.get('address.addressLine1')?.value }}<br />
              {{ addressGroup.get('address.addressLine2')?.value }}<br />
              {{ addressGroup.get('address.city')?.value }},
              {{ addressGroup.get('address.state')?.value }}
              {{ addressGroup.get('address.postalCode')?.value }}<br />
              {{ addressGroup.get('address.country')?.value }}
            </div>
          }

          @if (addressGroup.get('email')?.value) {
            <div>
              <strong>Emails:</strong>
              <ul>
                @for (emailCtrl of getEmails(i).controls; track $index) {
                  <li>{{ emailCtrl.value }}</li>
                }
              </ul>
            </div>
          }
        </div>
      } @else {
        <!-- EDIT MODE -->
        <div class="edit-section">
          <label>
            <input type="checkbox" formControlName="print" /> Print
          </label>
          <label>
            <input type="checkbox" formControlName="email" /> Email
          </label>

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

          @if (addressGroup.get('email')?.value) {
            <div formArrayName="emails">
              @for (emailCtrl of getEmails(i).controls; track $index; let j = $index) {
                <input [formControlName]="j" placeholder="Enter email" />
              }
            </div>
            <button type="button" (click)="addEmail(i)">Add Email</button>
          }

          <div class="buttons">
            <button type="button" (click)="completeSection(i)">Complete</button>
            <button type="button" class="remove-btn" (click)="removeAddress(i)">
              Remove
            </button>
          </div>
        </div>
      }
      <hr />
    </div>
  }
</div>

.container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.toolbar {
  margin-bottom: 20px;
}

.address-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  background: #fafafa;
  transition: background 0.2s;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.view-section {
  padding-left: 10px;
}

.edit-section input {
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

