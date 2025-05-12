import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from '../hra.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-edit-role',
  templateUrl: './edit-role.component.html',
  styleUrls: ['./edit-role.component.scss']
})
export class EditRoleComponent {

  submitted:any=false;
  public id:any=0;

  public valid = true;  
  constructor(
    private HraService: HraService,private router:Router,private route: ActivatedRoute,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.rolecreateform = new FormGroup({
      name: new FormControl('',[Validators.required,Validators.pattern(/^[a-zA-Z ]*$/)]),
    });          
  }

  rolecreateform: FormGroup;
  ngOnInit() {
    this.HraService.getRecord(this.id).subscribe((res:any) => {
      //console.log(res);
      if(res.status==false){
        this.toastr.showError(res.message);
      }
      this.rolecreateform.get('name')?.setValue(res.data.name);
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });      
  }
  URLConstants = URLConstants;

  onSubmit() {
      this.submitted=true;
      this.valid=true;          
      const payload = {
        "name":this.rolecreateform.value.name,      
      } 
      if(this.valid){ //add role
        this.updateRecord(payload);
      }      
      return 0;           
  }    

  updateRecord(payload:any)
  {
    this.HraService.updateRecord(this.id,payload).subscribe((res:any) => {
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
