import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from '../hra.service';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-add-leave-type',
  templateUrl: './add-leave-type.component.html',
  styleUrls: ['./add-leave-type.component.scss']
})
export class AddLeaveTypeComponent {

  submitted:any=false;
  public valid = true;
  constructor(
    private HraService: HraService,private router:Router,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.leavetypeform = new FormGroup({
      name: new FormControl('',[Validators.required]),
      for: new FormControl('student'),
    });
  }

  leavetypeform: FormGroup;
  ngOnInit() {}
  URLConstants = URLConstants;

  onSubmit() {
      this.submitted=true;
      this.valid=true;
      const payload = {
        "name":this.leavetypeform.value.name,
        "for" : this.leavetypeform.value.for
      }
      if(this.valid){ //add role
        this.addRecord(payload);
      }
      return 0;
  }

  addRecord(payload:any)
  {
    this.HraService.addLeaveTypeRecord(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.LEAVE_TYPE_LIST)]);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
