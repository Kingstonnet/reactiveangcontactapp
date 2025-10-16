import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      addresses: this.fb.array([])
    });
  }

  get addresses(): FormArray {
    return this.form.get('addresses') as FormArray;
  }

  // ✅ Create one address form group
  createAddressForm(): FormGroup {
    return this.fb.group({
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      emails: this.fb.array([this.createEmailForm()]),
      completed: [false] // used to collapse/expand form
    });
  }

  createEmailForm(): FormControl {
    return this.fb.control('', [Validators.required, Validators.email]);
  }

  addAddress() {
    this.addresses.push(this.createAddressForm());
  }

  addEmail(addressIndex: number) {
    const emails = this.addresses.at(addressIndex).get('emails') as FormArray;
    emails.push(this.createEmailForm());
  }

  removeEmail(addressIndex: number, emailIndex: number) {
    const emails = this.addresses.at(addressIndex).get('emails') as FormArray;
    emails.removeAt(emailIndex);
  }

  completeAddress(addressIndex: number) {
    const addressGroup = this.addresses.at(addressIndex);
    if (addressGroup.valid) {
      addressGroup.get('completed')?.setValue(true);
    } else {
      addressGroup.markAllAsTouched();
    }
  }

  editAddress(addressIndex: number) {
    const addressGroup = this.addresses.at(addressIndex);
    addressGroup.get('completed')?.setValue(false);
  }

  getEmails(addressIndex: number): string[] {
    const emails = this.addresses.at(addressIndex).get('emails') as FormArray;
    return emails.value;
  }
}

<div class="container">
  <h2>Dynamic Address Form</h2>

  <button type="button" (click)="addAddress()">Add Address</button>

  <div formArrayName="addresses">
    <div *ngFor="let address of addresses.controls; let i = index" [formGroupName]="i" class="address-card">

      <!-- ✅ Collapsed summary view -->
      <div *ngIf="address.get('completed')?.value" class="summary-card">
        <h3>Address {{ i + 1 }}</h3>
        <p><strong>Address Line 1:</strong> {{ address.get('addressLine1')?.value }}</p>
        <p *ngIf="address.get('addressLine2')?.value"><strong>Address Line 2:</strong> {{ address.get('addressLine2')?.value }}</p>
        <p><strong>City:</strong> {{ address.get('city')?.value }}</p>
        <p><strong>State:</strong> {{ address.get('state')?.value }}</p>
        <p><strong>Postal Code:</strong> {{ address.get('postalCode')?.value }}</p>
        <p><strong>Country:</strong> {{ address.get('country')?.value }}</p>
        <p><strong>Emails:</strong> {{ getEmails(i).join(', ') }}</p>
        <button type="button" (click)="editAddress(i)">Edit</button>
      </div>

      <!-- ✅ Editable address form -->
      <div *ngIf="!address.get('completed')?.value">
        <h3>Address {{ i + 1 }}</h3>

        <div>
          <label>Address Line 1:</label>
          <input formControlName="addressLine1" />
          <div *ngIf="address.get('addressLine1')?.touched && address.get('addressLine1')?.invalid">Required</div>
        </div>

        <div>
          <label>Address Line 2:</label>
          <input formControlName="addressLine2" />
        </div>

        <div>
          <label>City:</label>
          <input formControlName="city" />
          <div *ngIf="address.get('city')?.touched && address.get('city')?.invalid">Required</div>
        </div>

        <div>
          <label>State:</label>
          <input formControlName="state" />
          <div *ngIf="address.get('state')?.touched && address.get('state')?.invalid">Required</div>
        </div>

        <div>
          <label>Postal Code:</label>
          <input formControlName="postalCode" />
          <div *ngIf="address.get('postalCode')?.touched && address.get('postalCode')?.invalid">Required</div>
        </div>

        <div>
          <label>Country:</label>
          <input formControlName="country" />
          <div *ngIf="address.get('country')?.touched && address.get('country')?.invalid">Required</div>
        </div>

        <div formArrayName="emails">
          <label>Emails:</label>
          <div *ngFor="let emailCtrl of address.get('emails')['controls']; let j = index" class="email-row">
            <input [formControlName]="j" placeholder="Enter email" />
            <button type="button" (click)="removeEmail(i, j)">Remove</button>
            <div *ngIf="emailCtrl.touched && emailCtrl.invalid">
              <span *ngIf="emailCtrl.errors?.['required']">Required</span>
              <span *ngIf="emailCtrl.errors?.['email']">Invalid email</span>
            </div>
          </div>
          <button type="button" (click)="addEmail(i)">Add Email</button>
        </div>

        <button type="button" (click)="completeAddress(i)">Complete Address</button>
        <hr />
      </div>
    </div>
  </div>

  <pre>{{ form.value | json }}</pre>
</div>

.container {
  max-width: 650px;
  margin: 0 auto;
  padding: 10px;
}
.address-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 15px;
  margin-top: 15px;
  background: #fafafa;
}
.summary-card {
  background: #eaf7ea;
  padding: 10px;
  border-radius: 10px;
}
.email-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
input.ng-invalid.ng-touched {
  border: 1px solid red;
}
button {
  margin-top: 5px;
}


