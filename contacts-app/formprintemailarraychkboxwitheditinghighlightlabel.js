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
  viewMode = true;

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
    ];

    this.loadAddressesFromApi(apiResponse);
  }

  newAddressGroup(): FormGroup {
    const group = this.fb.group({
      print: [false],
      email: [false],
      completed: [false],
      editing: [false],
      fromApi: [false], // 🔹 track source
      originalData: [null], // 🔹 keep snapshot
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

    group.get('print')?.valueChanges.subscribe(() => this.updateValidators(group));
    group.get('email')?.valueChanges.subscribe(() => this.updateValidators(group));

    return group;
  }

  updateValidators(group: FormGroup) {
    const print = group.get('print')?.value;
    const email = group.get('email')?.value;
    const addressGroup = group.get('address') as FormGroup;
    const emailsArray = group.get('emails') as FormArray;

    // Clear all validators
    Object.keys(addressGroup.controls).forEach((key) => {
      addressGroup.get(key)?.clearValidators();
      addressGroup.get(key)?.updateValueAndValidity({ emitEvent: false });
    });
    emailsArray.controls.forEach((ctrl) => {
      const valueCtrl = (ctrl as FormGroup).get('value');
      valueCtrl?.clearValidators();
      valueCtrl?.updateValueAndValidity({ emitEvent: false });
    });

    // Apply dynamically
    if (print) {
      Object.keys(addressGroup.controls).forEach((key) => {
        addressGroup.get(key)?.setValidators(Validators.required);
        addressGroup.get(key)?.updateValueAndValidity({ emitEvent: false });
      });
    }

    if (email) {
      emailsArray.controls.forEach((ctrl) => {
        const valueCtrl = (ctrl as FormGroup).get('value');
        valueCtrl?.setValidators([Validators.required, Validators.email]);
        valueCtrl?.updateValueAndValidity({ emitEvent: false });
      });
    }
  }

  loadAddressesFromApi(apiData: any[]) {
    this.addressesForm.clear();

    apiData.forEach((data) => {
      const group = this.newAddressGroup();
      group.patchValue({
        print: data.print,
        email: data.email,
        address: data.address,
      });

      const emailsArray = group.get('emails') as FormArray;
      data.emails.forEach((email: string) => {
        emailsArray.push(
          this.fb.group({
            value: [email, [Validators.required, Validators.email]],
            completed: [true],
          })
        );
      });

      // Keep snapshot of API data
      group.get('originalData')?.setValue(JSON.parse(JSON.stringify(data)));
      group.get('fromApi')?.setValue(true);
      group.get('completed')?.setValue(true);
      this.updateValidators(group);
      group.disable();
      this.addressesForm.push(group);
    });
  }

  // 🟢 Add new section
  addAddress() {
    const g = this.newAddressGroup();
    g.get('editing')?.setValue(true);
    this.addressesForm.push(g);
    this.viewMode = false;
  }

  // 🟡 Cancel logic
  cancelSection(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;
    const fromApi = group.get('fromApi')?.value;

    if (!fromApi) {
      // new section → just remove
      this.addressesForm.removeAt(index);
      return;
    }

    // from API → revert back
    const original = group.get('originalData')?.value;
    if (original) {
      const emailsArray = group.get('emails') as FormArray;
      emailsArray.clear();
      original.emails.forEach((email: string) => {
        emailsArray.push(
          this.fb.group({
            value: [email, [Validators.required, Validators.email]],
            completed: [true],
          })
        );
      });

      group.patchValue({
        print: original.print,
        email: original.email,
        address: original.address,
      });
    }

    group.disable();
    group.get('editing')?.setValue(false);
  }

  getEmails(index: number): FormArray {
    return this.addressesForm.at(index).get('emails') as FormArray;
  }

  addEmail(addressIndex: number) {
    const emails = this.getEmails(addressIndex);
    if (emails.length >= 5) return;

    emails.push(
      this.fb.group({
        value: ['', [Validators.required, Validators.email]],
        completed: [false],
      })
    );
    this.updateValidators(this.addressesForm.at(addressIndex) as FormGroup);
  }

  completeEmail(addressIndex: number, emailIndex: number) {
    const emailGroup = this.getEmails(addressIndex).at(emailIndex) as FormGroup;
    const valueCtrl = emailGroup.get('value');
    valueCtrl?.markAsTouched();
    if (valueCtrl?.valid) {
      emailGroup.get('completed')?.setValue(true);
      valueCtrl.disable();
    }
  }

  removeEmail(addressIndex: number, emailIndex: number) {
    this.getEmails(addressIndex).removeAt(emailIndex);
  }

  editSection(index: number) {
    const g = this.addressesForm.at(index) as FormGroup;
    g.enable();
    g.get('editing')?.setValue(true);
  }

  completeSection(index: number) {
    const group = this.addressesForm.at(index) as FormGroup;
    this.updateValidators(group);
    group.markAllAsTouched();

    if (group.valid) {
      group.disable();
      group.get('editing')?.setValue(false);
      group.get('completed')?.setValue(true);

      // Update originalData snapshot if it came from API
      if (group.get('fromApi')?.value) {
        const currentData = group.getRawValue();
        const emails = currentData.emails.map((e: any) => e.value);
        group.get('originalData')?.setValue({
          print: currentData.print,
          email: currentData.email,
          address: currentData.address,
          emails,
        });
      }
    } else {
      alert('Please fill all required fields correctly.');
    }
  }

  removeAddress(index: number) {
    if (confirm('Remove this address section?')) {
      this.addressesForm.removeAt(index);
    }
  }

  saveAll() {
    const dataToSave = this.addressesForm.getRawValue();
    console.log('Saving to API:', dataToSave);
    alert('All sections saved successfully.');
    this.viewMode = true;
  }

  editAll() {
    this.viewMode = false;
    this.addressesForm.disable();
  }
}


<div *ngFor="let addressGroup of addressesForm.controls; let i = index" class="address-card">
  <div class="card-header">
    <h3>Address {{ i + 1 }}</h3>
    @if (!addressGroup.get('editing')?.value) {
      <button type="button" class="icon-btn" (click)="editSection(i)">✏️ Edit</button>
    }
    <button type="button" class="icon-btn danger" (click)="removeAddress(i)">🗑️ Remove</button>
  </div>

  <!-- ========== VIEW MODE ========== -->
  @if (!addressGroup.get('editing')?.value) {
    <div class="view-section">
      <div><strong>Print:</strong> {{ addressGroup.get('print')?.value ? 'Yes' : 'No' }}</div>
      <div><strong>Email:</strong> {{ addressGroup.get('email')?.value ? 'Yes' : 'No' }}</div>

      @if (addressGroup.get('print')?.value) {
        <div class="view-grid">
          <div><label>Address Line 1:</label><span>{{ addressGroup.get('address.addressLine1')?.value }}</span></div>
          <div><label>Address Line 2:</label><span>{{ addressGroup.get('address.addressLine2')?.value }}</span></div>
          <div><label>City:</label><span>{{ addressGroup.get('address.city')?.value }}</span></div>
          <div><label>State:</label><span>{{ addressGroup.get('address.state')?.value }}</span></div>
          <div><label>Postal Code:</label><span>{{ addressGroup.get('address.postalCode')?.value }}</span></div>
          <div><label>Country:</label><span>{{ addressGroup.get('address.country')?.value }}</span></div>
        </div>
      }

      @if (addressGroup.get('email')?.value) {
        <div class="view-grid">
          <div><label>Emails:</label>
            <div class="email-list">
              @for (email of getEmails(i).controls; track email) {
                <span>{{ email.get('value')?.value }}</span>
              }
            </div>
          </div>
        </div>
      }
    </div>
  }

  <!-- ========== EDIT MODE ========== -->
  @if (addressGroup.get('editing')?.value) {
    <div class="edit-section">
      <div class="checkboxes">
        <label><input type="checkbox" [formControl]="addressGroup.get('print')"> Print</label>
        <label><input type="checkbox" [formControl]="addressGroup.get('email')"> Email</label>
      </div>

      @if (addressGroup.get('print')?.value) {
        <div class="form-grid">
          <div>
            <label>Address Line 1</label>
            <input type="text" [formControl]="addressGroup.get('address.addressLine1')" />
            @if (addressGroup.get('address.addressLine1')?.touched && addressGroup.get('address.addressLine1')?.invalid) {
              <div class="error">Address Line 1 is required.</div>
            }
          </div>

          <div>
            <label>Address Line 2</label>
            <input type="text" [formControl]="addressGroup.get('address.addressLine2')" />
          </div>

          <div>
            <label>City</label>
            <input type="text" [formControl]="addressGroup.get('address.city')" />
            @if (addressGroup.get('address.city')?.touched && addressGroup.get('address.city')?.invalid) {
              <div class="error">City is required.</div>
            }
          </div>

          <div>
            <label>State</label>
            <input type="text" [formControl]="addressGroup.get('address.state')" />
            @if (addressGroup.get('address.state')?.touched && addressGroup.get('address.state')?.invalid) {
              <div class="error">State is required.</div>
            }
          </div>

          <div>
            <label>Postal Code</label>
            <input type="text" [formControl]="addressGroup.get('address.postalCode')" />
            @if (addressGroup.get('address.postalCode')?.touched && addressGroup.get('address.postalCode')?.invalid) {
              <div class="error">Postal Code is required.</div>
            }
          </div>

          <div>
            <label>Country</label>
            <input type="text" [formControl]="addressGroup.get('address.country')" />
            @if (addressGroup.get('address.country')?.touched && addressGroup.get('address.country')?.invalid) {
              <div class="error">Country is required.</div>
            }
          </div>
        </div>
      }

      @if (addressGroup.get('email')?.value) {
        <div class="email-section">
          <label>Emails</label>
          <div class="email-list">
            @for (emailCtrl of getEmails(i).controls; track emailCtrl) {
              <div class="email-item">
                @if (!emailCtrl.get('completed')?.value) {
                  <input type="email" [formControl]="emailCtrl.get('value')" placeholder="Enter email" />
                  <button type="button" (click)="completeEmail(i, $index)">✔</button>
                  <button type="button" (click)="removeEmail(i, $index)">✖</button>
                  @if (emailCtrl.get('value')?.touched && emailCtrl.get('value')?.invalid) {
                    <div class="error">Valid email required.</div>
                  }
                } @else {
                  <span>{{ emailCtrl.get('value')?.value }}</span>
                  <button type="button" (click)="removeEmail(i, $index)">🗑️</button>
                }
              </div>
            }
          </div>
          @if (getEmails(i).length < 5) {
            <button type="button" class="add-email" (click)="addEmail(i)">+ Add Email</button>
          } @else {
            <div class="max-msg">Max 5 emails reached.</div>
          }
        </div>
      }

      <div class="button-row">
        <button type="button" (click)="completeSection(i)">Complete</button>
        <button type="button" class="cancel" (click)="cancelSection(i)">Cancel</button>
      </div>
    </div>
  }
</div>

<div class="final-buttons">
  <button type="button" (click)="addAddress()">+ Add Address</button>
  <button type="button" (click)="saveAll()">Save All</button>
  <button type="button" (click)="editAll()">Edit All</button>
</div>


.address-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  background: #fafafa;
  transition: border 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

/* 🔹 Highlight currently editing section */
.address-card.editing {
  border: 2px solid #007acc;
  background: #f0f8ff;
  box-shadow: 0 0 10px rgba(0, 122, 204, 0.2);
}
