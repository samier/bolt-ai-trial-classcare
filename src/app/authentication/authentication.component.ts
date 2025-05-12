import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {

  loginForm!: UntypedFormGroup

  constructor(
    private formBuilder: UntypedFormBuilder,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email : ['valex@demo.com', Validators.required],
      password: ['valex', Validators.required]
    })
  }

  get form(){
    return this.loginForm.controls;
  }

  Submit(){
    if (this.loginForm.controls['email'].value  === 'valex@demo.com' && this.loginForm.controls['password'].value === 'valex') {
      this.router.navigate(['/dashboard']);
    }
  }

}
