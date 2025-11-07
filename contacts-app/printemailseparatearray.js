mainForm = this.fb.group({
  addresses: this.fb.array([]),
  emails: this.fb.array([]),
});

{
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  completed: false,
  editing: false,
  fromApi: false,
  originalData: null
}

{
  emailList: this.fb.array([]), // up to 5 emails
  completed: false,
  editing: false,
  fromApi: false,
  originalData: null
}


import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  mainForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.mainForm = this.fb.group({
      addresses: this.fb.array([]),
      emails: this.fb.array([]),
    });
  }

  ngOnInit() {
    // 🔹 Example API response
    const apiResponse = {
      addresses: [
        {
          addressLine1: '123 Main St',
          addressLine2: 'Suite 200',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
        },
      ],
      emails: [['info@example.com', 'support@example.com']],
    };

    this.loadFromApi(apiResponse);
  }

  /** ─────────── Address Logic ─────────── **/
  get addresses() {
    return this.mainForm.get('addresses') as FormArray;
  }

  newAddressGroup(): FormGroup {
    return this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      completed: [false],
      editing: [false],
      fromApi: [false],
      originalData: [null],
    });
  }

  addAddress() {
    const g = this.newAddressGroup();
    g.get('editing')?.setValue(true);
    this.addresses.push(g);
  }

  completeAddress(index: number) {
    const group = this.addresses.at(index) as FormGroup;
    group.markAllAsTouched();
    if (group.valid) {
      group.disable();
      group.get('editing')?.setValue(false);
      group.get('completed')?.setValue(true);

      if (group.get('fromApi')?.value) {
        group.get('originalData')?.setValue(group.getRawValue());
      }
    }
  }

  cancelAddress(index: number) {
    const group = this.addresses.at(index) as FormGroup;
    if (!group.get('fromApi')?.value) {
      this.addresses.removeAt(index);
    } else {
      const original = group.get('originalData')?.value;
      if (original) group.patchValue(original);
      group.disable();
      group.get('editing')?.setValue(false);
    }
  }

  editAddress(index: number) {
    const g = this.addresses.at(index);
    g.enable();
    g.get('editing')?.setValue(true);
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
  }

  /** ─────────── Email Logic ─────────── **/
  get emails() {
    return this.mainForm.get('emails') as FormArray;
  }

  newEmailGroup(): FormGroup {
    return this.fb.group({
      emailList: this.fb.array([]),
      completed: [false],
      editing: [false],
      fromApi: [false],
      originalData: [null],
    });
  }

  getEmailList(index: number): FormArray {
    return this.emails.at(index).get('emailList') as FormArray;
  }

  addEmailSection() {
    const g = this.newEmailGroup();
    g.get('editing')?.setValue(true);
    this.emails.push(g);
  }

  addEmailField(sectionIndex: number) {
    const list = this.getEmailList(sectionIndex);
    if (list.length >= 5) return;
    list.push(this.fb.group({ value: ['', [Validators.required, Validators.email]], completed: [false] }));
  }

  completeEmail(sectionIndex: number, emailIndex: number) {
    const ctrl = this.getEmailList(sectionIndex).at(emailIndex);
    const valueCtrl = ctrl.get('value');
    valueCtrl?.markAsTouched();
    if (valueCtrl?.valid) {
      ctrl.get('completed')?.setValue(true);
      valueCtrl.disable();
    }
  }

  removeEmail(sectionIndex: number, emailIndex: number) {
    this.getEmailList(sectionIndex).removeAt(emailIndex);
  }

  completeEmailSection(index: number) {
    const g = this.emails.at(index) as FormGroup;
    g.markAllAsTouched();

    const list = g.get('emailList') as FormArray;
    if (list.length === 0 || list.invalid) {
      alert('Please add at least one valid email.');
      return;
    }

    g.disable();
    g.get('editing')?.setValue(false);
    g.get('completed')?.setValue(true);
  }

  cancelEmailSection(index: number) {
    const group = this.emails.at(index) as FormGroup;
    if (!group.get('fromApi')?.value) {
      this.emails.removeAt(index);
    } else {
      const original = group.get('originalData')?.value;
      if (original) group.patchValue(original);
      group.disable();
      group.get('editing')?.setValue(false);
    }
  }

  editEmailSection(index: number) {
    const g = this.emails.at(index);
    g.enable();
    g.get('editing')?.setValue(true);
  }

  removeEmailSection(index: number) {
    this.emails.removeAt(index);
  }

  /** ─────────── API load/save ─────────── **/
  loadFromApi(api: any) {
    this.addresses.clear();
    this.emails.clear();

    api.addresses.forEach((addr: any) => {
      const g = this.newAddressGroup();
      g.patchValue(addr);
      g.get('fromApi')?.setValue(true);
      g.get('originalData')?.setValue(JSON.parse(JSON.stringify(addr)));
      g.get('completed')?.setValue(true);
      g.disable();
      this.addresses.push(g);
    });

    api.emails.forEach((emailList: string[]) => {
      const g = this.newEmailGroup();
      const list = g.get('emailList') as FormArray;
      emailList.forEach((e) =>
        list.push(this.fb.group({ value: [e, [Validators.required, Validators.email]], completed: [true] }))
      );
      g.get('fromApi')?.setValue(true);
      g.get('originalData')?.setValue(emailList);
      g.get('completed')?.setValue(true);
      g.disable();
      this.emails.push(g);
    });
  }

  saveAll() {
    const payload = this.mainForm.getRawValue();
    console.log('Payload for API:', payload);
    alert('All data saved successfully.');
  }
}

<h2>Addresses</h2>
<div
  *ngFor="let addressGroup of addresses.controls; let i = index"
  class="address-card"
  [class.editing]="addressGroup.get('editing')?.value"
>
  <div class="card-header">
    <h3>Address {{ i + 1 }}</h3>
    @if (!addressGroup.get('editing')?.value) {
      <button class="icon-btn" (click)="editAddress(i)">✏️</button>
    }
    <button class="icon-btn danger" (click)="removeAddress(i)">🗑️</button>
  </div>

  @if (!addressGroup.get('editing')?.value) {
    <div class="view-grid">
      <div><label>Address Line 1:</label><span>{{ addressGroup.get('addressLine1')?.value }}</span></div>
      <div><label>Address Line 2:</label><span>{{ addressGroup.get('addressLine2')?.value }}</span></div>
      <div><label>City:</label><span>{{ addressGroup.get('city')?.value }}</span></div>
      <div><label>State:</label><span>{{ addressGroup.get('state')?.value }}</span></div>
      <div><label>Postal Code:</label><span>{{ addressGroup.get('postalCode')?.value }}</span></div>
      <div><label>Country:</label><span>{{ addressGroup.get('country')?.value }}</span></div>
    </div>
  } @else {
    <div class="form-grid">
      <div><label>Address Line 1</label><input type="text" [formControl]="addressGroup.get('addressLine1')" /></div>
      <div><label>Address Line 2</label><input type="text" [formControl]="addressGroup.get('addressLine2')" /></div>
      <div><label>City</label><input type="text" [formControl]="addressGroup.get('city')" /></div>
      <div><label>State</label><input type="text" [formControl]="addressGroup.get('state')" /></div>
      <div><label>Postal Code</label><input type="text" [formControl]="addressGroup.get('postalCode')" /></div>
      <div><label>Country</label><input type="text" [formControl]="addressGroup.get('country')" /></div>
    </div>
    <div class="button-row">
      <button (click)="completeAddress(i)">Complete</button>
      <button class="cancel" (click)="cancelAddress(i)">Cancel</button>
    </div>
  }
</div>
<button (click)="addAddress()">+ Add Address</button>

<hr />

<h2>Emails</h2>
<div
  *ngFor="let emailGroup of emails.controls; let i = index"
  class="address-card"
  [class.editing]="emailGroup.get('editing')?.value"
>
  <div class="card-header">
    <h3>Email Group {{ i + 1 }}</h3>
    @if (!emailGroup.get('editing')?.value) {
      <button class="icon-btn" (click)="editEmailSection(i)">✏️</button>
    }
    <button class="icon-btn danger" (click)="removeEmailSection(i)">🗑️</button>
  </div>

  @if (!emailGroup.get('editing')?.value) {
    <div class="email-list">
      @for (emailCtrl of getEmailList(i).controls; track emailCtrl) {
        <span>{{ emailCtrl.get('value')?.value }}</span>
      }
    </div>
  } @else {
    <div class="email-section">
      @for (emailCtrl of getEmailList(i).controls; track emailCtrl) {
        <div class="email-item">
          @if (!emailCtrl.get('completed')?.value) {
            <input type="email" [formControl]="emailCtrl.get('value')" placeholder="Enter email" />
            <button (click)="completeEmail(i, $index)">✔</button>
            <button (click)="removeEmail(i, $index)">✖</button>
          } @else {
            <span>{{ emailCtrl.get('value')?.value }}</span>
            <button (click)="removeEmail(i, $index)">🗑️</button>
          }
        </div>
      }
      @if (getEmailList(i).length < 5) {
        <button class="add-email" (click)="addEmailField(i)">+ Add Email</button>
      } @else {
        <div class="max-msg">Max 5 emails reached.</div>
      }
    </div>
    <div class="button-row">
      <button (click)="completeEmailSection(i)">Complete</button>
      <button class="cancel" (click)="cancelEmailSection(i)">Cancel</button>
    </div>
  }
</div>
<button (click)="addEmailSection()">+ Add Email</button>

<hr />

<div class="final-buttons">
  <button (click)="saveAll()">Save All</button>
</div>

.address-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  background: #fafafa;
  transition: all 0.3s ease;
}
.address-card.editing {
  border: 2px solid #007acc;
  background: #f0f8ff;
  box-shadow: 0 0 10px rgba(0, 122, 204, 0.2);
}

.view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 20px;
}
.form-grid input {
  width: 100%;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.email-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.email-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.add-email {
  background: #007acc;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
}
.max-msg {
  color: #555;
  font-size: 13px;
}

.button-row {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}
button.cancel {
  background: #b71c1c;
  color: white;
}
