import { Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {
  private errorDefinitions = new Map<string, ErrorDefinition>([
      ['required', { text: 'The input is required.' }],
      ['email', { text: 'Please enter valid email address.' }],
      ['min', { text: 'The input value is less than min value ({0}).', argsFn: (e) => [e.min] }],
      ['max', { text: 'The input value exceeded max value ({0}).', argsFn: (e) => [e.max] }],
      ['minlength', { text: ' The input must consist of at least ({0}) characters.', argsFn: (e) => [e.requiredLength] }],
      ['maxlength', { text: ' Maximum length exceeded. Please enter a maximum of ({0}) characters.', argsFn: (e) => [e.requiredLength] }],
      ['upperCase', { text: 'The input should be upper case.' }],
      ['lowerCase', { text: 'The input should be lower case.' }],
      ['customMessage', { text: '{0}', argsFn: (e) => [e] }],
      ['number', { text: 'The input is not valid number.' }],
      ['matDatepickerParse', { text: 'The Date is not valid.' }],
      ['matDatepickerMin', { text: "The Date is not valid. it's past date" }],
      ['matDatepickerMax', { text: "The Date is not valid. it's future date" }],
  ]);

  hasErrors(control: FormControl): boolean {
      return !!(control?.errors);
  }

  getErrors(control: FormControl): string[] {
      const errorMessages: string[] = [];
      if (control && control.errors) {
          for (let errorName of Object.keys(control.errors)) {
              const errorDefinition = this.errorDefinitions.get(errorName);
              if (errorDefinition) {
                  errorMessages.push(this.prepareErrorMessage(errorDefinition, control.errors[errorName]));
              } else {
                  errorMessages.push(`The input value is not valid [${errorName}, ${JSON.stringify(control.errors[errorName])}].`);
                  break;
              }
          }
      }
      return errorMessages;
  }

  prepareErrorMessage(errorDefinition: ErrorDefinition, error: any): string {
      if (errorDefinition.argsFn && error) {
          const args = errorDefinition.argsFn(error);
          if (args.length) {
              let text = errorDefinition.text;
              args.forEach((arg, i) => text = text.replace(`{${i}}`, arg));
              return text;
          }
      }
      return errorDefinition.text;
  }

  getFormTouchedAndValidation(formName: FormGroup | FormArray): void {
    Object.keys(formName.controls).forEach(field => {
      const control = formName.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      } else if (control instanceof FormGroup || control instanceof FormArray) {
        this.getFormTouchedAndValidation(control);
      }
    });
  }

   getFormTouchedAndDisabled(formName: FormGroup): void {
    Object.keys(formName.controls).forEach(field => {
      const control = formName.controls[field];
      control.disable()
    });
  }

}

interface ErrorDefinition {
  text: string;
  argsFn?: (e: any) => any[];
}
