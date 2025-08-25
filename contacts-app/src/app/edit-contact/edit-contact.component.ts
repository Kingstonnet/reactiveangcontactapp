import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../contacts/contacts.service';
import { addressTYpeValues, phoneTYpeValues } from '../contacts/contact.model';
import {restrictedwords} from '../validators/restricted-words.validators'
import { debounceTime, distinctUntilChanged } from 'rxjs';

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

  phoneTypes = phoneTYpeValues;
  addressTypes = addressTYpeValues;

  contactForm = this.fb.nonNullable.group({
    id: '',
    personal:false,
    firstName: ['',[Validators.required,Validators.minLength(3)]],
    //firstName: new FormControl('',Validators.required),
    lastName: '',
    dateOfBirth: '',
    favoritesRanking: <number | null>null,

    // phone: this.fb.nonNullable.group({
    //   phoneNumber: '',
    //   phoneType: '',
    // }),

    phones: this.fb.array([this.createPhoneGroup()]),

    address: this.fb.nonNullable.group({
      streetAddress: ['',Validators.required],
      city: ['',Validators.required],
      state: ['',Validators.required],
      postalCode: ['',Validators.required],
      addressType: '',
    }),
      notes:['',restrictedwords(['foo','bar'])]
  });

  constructor(
    private route: ActivatedRoute,
    private contactService: ContactsService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const contactId = this.route.snapshot.params['id'];
    if (!contactId) {
      this.subscribeToAddressschanges();
      return;
    }

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


      //this.contactForm.controls.phones.clear();

      // contact.phones.forEach((phone) => {
      //   this.contactForm.controls.phones.push(this.createPhoneGroup());
      // });

      for (let i = 1; i < contact.phones.length; i++) {
        //this.contactForm.controls.phones.push(this.createPhoneGroup());
        this.addPhone();
      }

      this.contactForm.setValue(contact);

      this.subscribeToAddressschanges();
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

  get firstName(){
    return this.contactForm.controls.firstName;//template just have firstname to shorten
  }

  saveContact() {
    //console.log(this.contactForm.controls.firstName.value);
    console.log(this.contactForm.value.dateOfBirth,typeof this.contactForm.value.dateOfBirth);
    console.log(this.contactForm.getRawValue());
    //this.contactService.saveContact(this.contactForm.value).subscribe({
    this.contactService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts']),
    });
  }

   get notes(){
    return this.contactForm.controls.notes;
  }

    subscribeToAddressschanges(){
    const addressgroup=this.contactForm.controls.address;
    addressgroup.valueChanges
    .pipe(distinctUntilChanged(this.stringifycompare))
    .subscribe(()=>{
      for(const controlName in addressgroup.controls){
        addressgroup.get(controlName)?.removeValidators([Validators.required]);
        addressgroup.get(controlName)?.updateValueAndValidity();
      }
    });

    addressgroup.valueChanges
    .pipe(debounceTime(3000), distinctUntilChanged(this.stringifycompare))
    .subscribe(()=>{
      for(const controlName in addressgroup.controls){
        addressgroup.get(controlName)?.addValidators([Validators.required]);
        addressgroup.get(controlName)?.updateValueAndValidity();
      }
    });
  }

   stringifycompare(a:any,b:any){
      return JSON.stringify(a) === JSON.stringify(b);
    }

  createPhoneGroup() {

  //  return this.fb.nonNullable.group({
  //     phoneNumber: '',
  //     phoneType: '',
  //     preferred: false
  //   });
  
  

  const phgroup= this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: '',
      preferred: false
    });

    //phgroup.controls.preferred.statusChanges

    phgroup.controls.preferred.valueChanges
    //.pipe(distinctUntilChanged((a,b)=>JSON.stringify(a) === JSON.stringify(b)))
    .pipe(distinctUntilChanged(this.stringifycompare))
    .subscribe(val=>{
      if(val){
        //phgroup.controls.phoneType.setValue('mobile');
        phgroup.controls.phoneNumber.addValidators([Validators.required,Validators.minLength(10)]);
      }
      else{
       // phgroup.controls.phoneNumber.clearValidators();
       phgroup.controls.phoneNumber.removeValidators([Validators.required,Validators.minLength(10)]);
       phgroup.controls.phoneNumber.updateValueAndValidity();
      }
      
    });
    return phgroup;
  }

  addPhone() {
    this.contactForm.controls.phones.push(this.createPhoneGroup());
  }
}
