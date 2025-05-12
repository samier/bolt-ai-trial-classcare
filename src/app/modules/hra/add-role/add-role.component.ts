import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from '../hra.service';
import { Toastr } from 'src/app/core/services/toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent {

  submitted:any=false;
  public valid = true;
  constructor(
    private HraService: HraService,private router:Router,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.rolecreateform = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z ]*$/)]),
    });
  }

  rolecreateform: FormGroup;
  ngOnInit() {}
  URLConstants = URLConstants;

  onSubmit() {
      this.submitted=true;
      this.valid=true;          
      const payload = {
        "name":this.rolecreateform.value.name,      
      } 
      if(this.valid){ //add role
        this.addRecord(payload);
      }      
      return 0;           
  }    

  addRecord(payload:any)
  {
    this.HraService.addRecord(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.ROLE_LIST)]);
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
