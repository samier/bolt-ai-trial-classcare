import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from '../../hra/hra.service';
import { ExamTypeService } from '../exam-type.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent {

  submitted:any=false;
  public valid = true;
  constructor(
    private ExamTypeService: ExamTypeService,private router:Router,private fb:FormBuilder, private toastr: Toastr, public CommonService: CommonService
  ) {
    this.examtypecreateform = new FormGroup({
      name: new FormControl('',[Validators.required]),
      status: new FormControl('1',[Validators.required]),
      // template_id: new FormControl('',[Validators.required]),
    });
  }

  examtypecreateform: FormGroup;

  templateList = [];
  selectedTemplate = [];
  ngOnInit() {
    this.ExamTypeService.getTemplateList().subscribe((resp:any) => {
      if(resp.status){
        this.templateList = resp.data
        this.selectedTemplate = resp.data[0].id;
      }
    })
  }
  URLConstants = URLConstants;

  onSubmit() {
      this.submitted=true;
      this.valid=true;          
      if(this.valid){ //add role
        this.addRecord(this.examtypecreateform.value);
      }                    
  }    

  addRecord(payload:any)
  {    
    this.ExamTypeService.addRecord(payload).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.router.navigate([this.setUrl(URLConstants.EXAM_TYPE_LIST)]);
        this.toastr.showSuccess(res.message);        
      }    
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });    
  }  
 
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
