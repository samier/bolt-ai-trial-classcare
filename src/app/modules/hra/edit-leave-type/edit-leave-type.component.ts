import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from '../hra.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-edit-leave-type',
  templateUrl: './edit-leave-type.component.html',
  styleUrls: ['./edit-leave-type.component.scss']
})
export class EditLeaveTypeComponent {

  submitted:any=false;
  id:any;
  public valid = true;
  constructor(
    private HraService: HraService,private route:ActivatedRoute,private router:Router,private fb:FormBuilder, private toastr: Toastr
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.leavetypeform = new FormGroup({
      name: new FormControl('',[Validators.required]),
      for: new FormControl('student'),
    });
  }

  leavetypeform: FormGroup;
  ngOnInit() {
    this.HraService.getLeaveTypeRecord(this.id).subscribe((res:any) => {
      //console.log(res);
      if(res.status==false){
        this.toastr.showError(res.message);
      }
      this.leavetypeform.get('name')?.setValue(res.data.name);
      this.leavetypeform.get('for')?.setValue(res.data.for);
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });
  }
  URLConstants = URLConstants;

  onSubmit() { 
      this.submitted=true;
      this.valid=true;
      const payload = {
        "name":this.leavetypeform.value.name,
        "for" : this.leavetypeform.value.for
      }
      if(this.valid){ //add role
        this.updateRecord(payload);
      }
      return 0;
  }

  updateRecord(payload:any)
  {
    this.HraService.updateLeaveTypeRecord(this.id,payload).subscribe((res:any) => {
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
