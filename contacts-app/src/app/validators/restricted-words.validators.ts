import { AbstractControl, ValidationErrors } from "@angular/forms";

export function restrictedwords(words:string[]){
  return   (control:AbstractControl):ValidationErrors | null=>{

  const invalidwords=  words.map(w=>control.value.includes(w) ? w: null).filter(w=>w!==null);
    return invalidwords.length > 0 ? {restrictedwords:invalidwords.join(' ')}: null;
  }
} 

   

