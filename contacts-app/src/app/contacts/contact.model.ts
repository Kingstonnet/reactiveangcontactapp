export interface Contact {
  id: string,
  personal:boolean,
  firstName: string,
  lastName: string,
//  dateOfBirth: Date | null,
  dateOfBirth: string,
  favoritesRanking: number | null,
 // phone: Phone,
  phones: Phone[],
  address: Address,
  notes: string 
}

export interface Phone {
  phoneNumber: string,
  phoneType: string,
  preferred: boolean
}

export interface Address {
  streetAddress: string,
  city: string,
  state: string,
  postalCode: string,
  addressType: string,
}

export const phoneTYpeValues=[
  {title:'Mobile',value:'mobile'},
  {title:'Work',value:'work'},
  {title:'Other',value:'other'},
  ]

  export const addressTYpeValues=[
    {title:'Home',value:'home'},
    {title:'Work',value:'work'},
    {title:'Other',value:'other'},
    ]