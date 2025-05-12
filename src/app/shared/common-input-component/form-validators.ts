import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import * as moment from 'moment';
import { of, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export class ClassCareValidatores {

    static number(decimals: number, negative: boolean): ValidatorFn {
        const regExp = `${negative ? '-?' : ''}\[0-9]+${decimals ? `.?[0-9]{0,${decimals}}` : ''}`;
        const fn = Validators.pattern(regExp);
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && fn(control))
                return { "number": true };
            return null;
        };
    }

    static upperCase(control: AbstractControl): ValidationErrors | null {
        if (control.value && control.value !== control.value.toString().toUpperCase())
            return { "upperCase": true };
        return null;
    }

    static lowerCase(control: AbstractControl): ValidationErrors | null {
        if (control.value && control.value !== control.value.toString().toLowerCase())
            return { "lowerCase": true };
        return null;
    }

    static minDate(minDate: Date): ValidatorFn {
        const strDate = moment(minDate).format('DD/MM/yyyy');
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && new Date(control.value) < minDate)
                return { "min": { min: strDate } };
            return null;
        };
    }

    static maxDate(maxDate: Date): ValidatorFn {
        const strDate = moment(maxDate).format('DD/MM/yyyy');
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && new Date(control.value) > maxDate)
                return { "max": { max: strDate } };
            return null;
        };
    }

    static pattern(pattern: string | RegExp, message?: string): ValidatorFn {
        const fn = Validators.pattern(pattern);
        const customMessage = message ?? 'The input value does not have correct format.';
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = fn(control);
            if (errors)
                return { customMessage: customMessage };
            return null;
        };
    }
    
    static min(number: number, message?: string): ValidatorFn {
        const fn = Validators.min(number);
        const customMessage = message ?? 'The input value does not have correct format.';
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = fn(control);
            if (errors)
                return { customMessage: customMessage };
            return null;
        };
    }

    static max(number: number, message?: string): ValidatorFn {
        const fn = Validators.max(number);
        const customMessage = message ?? 'The input value does not have correct format.';
        return (control: AbstractControl): ValidationErrors | null => {
            const errors = fn(control);
            if (errors)
                return { customMessage: customMessage };
            return null;
        };
    }

    static minSelection(minSelection: number, message?: string) {
        const customMessage = message ?? 'Please select atleast ' + minSelection + ' values';
        return (control: AbstractControl): Observable<ValidationErrors | null> => {
            return of(null).pipe(
                delay(0), 
                map(() => {
                    if (control.value.length < minSelection) {
                      return { customMessage: customMessage };
                    }
                    return null;
                })
            );
        };
    }
}
