import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css'],
})
export class EditContactComponent implements OnInit {
  // contactForm = new FormGroup({
  //   id: new FormControl(),
  //   firstName: new FormControl(),
  //   lastName: new FormControl(),
  //   dateOfBirth: new FormControl(),
  //   favoritesRanking: new FormControl(),
  //   phone: new FormGroup({
  //     phoneNumber: new FormControl(),
  //     phoneType: new FormControl(),
  //   }),
  //   address: new FormGroup({
  //     streetAddress: new FormControl(),
  //     city: new FormControl(),
  //     state: new FormControl(),
  //     postalCode: new FormControl(),
  //     addressType: new FormControl(),
  //   }),
  // });

  contactForm = this.fb.nonNullable.group({
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: <Date | null>null,
    favoritesRanking: <number | null>null,
    phone: this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: '',
    }),
    address: this.fb.nonNullable.group({
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      addressType: '',
    }),
  });

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactsService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const contactId = this.route.snapshot.params['id'];
    if (!contactId) return;

    this.contactService.getContact(contactId).subscribe((contact) => {
      if (!contact) return;
      // this.firstName.setValue(contact.firstName);
      // this.lastName.setValue(contact.lastName);
      // this.dateOfBirth.setValue(contact.dateOfBirth);
      // this.favoritesRanking.setValue(contact.favoritesRanking);
      console.log('***********', contact);

      //what if i want partial values
      //**********const names={firstName: contact.firstName, lastName: contact.lastName};
      //************this.contactForm.patchValue(names);

      this.contactForm.setValue(contact);
      // this.contactForm.controls.id.setValue(contact.id);
      // this.contactForm.controls.firstName.setValue(contact.firstName);
      // this.contactForm.controls.lastName.setValue(contact.lastName);
      // this.contactForm.controls.dateOfBirth.setValue(contact.dateOfBirth);
      // this.contactForm.controls.favoritesRanking.setValue(contact.favoritesRanking);
      // this.contactForm.controls.phone.controls.phoneNumber.setValue(
      //   contact.phone?.phoneNumber
      // );
      // this.contactForm.controls.phone.controls.phoneType.setValue(
      //   contact.phone?.phoneType
      // );
      // this.contactForm.controls.address.controls.streetAddress.setValue(
      //   contact.address?.streetAddress
      // );
      // this.contactForm.controls.address.controls.city.setValue(
      //   contact.address?.city
      // );
      // this.contactForm.controls.address.controls.state.setValue(
      //   contact.address?.state
      // );
      // this.contactForm.controls.address.controls.postalCode.setValue(
      //   contact.address?.postalCode
      // );
      // this.contactForm.controls.address.controls.addressType.setValue(
      //   contact.address?.addressType
      // );
    });
  }

  saveContact() {
    console.log(this.contactForm.controls.firstName.value);
    console.log(this.contactForm.value);
    //this.contactService.saveContact(this.contactForm.value).subscribe({
    this.contactService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts']),
    });
  }
}
