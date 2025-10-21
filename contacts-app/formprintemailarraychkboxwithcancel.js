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

@if (addressGroup.get('editing')?.value) {
  <div class="button-row">
    <button type="button" (click)="completeSection($index)">Complete</button>
    <button type="button" class="cancel" (click)="cancelSection($index)">Cancel</button>
  </div>
}


.button-row {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

button.cancel {
  background: #b71c1c;
}
button.cancel:hover {
  background: #c62828;
}

