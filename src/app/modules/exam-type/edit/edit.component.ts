import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExamTypeService } from '../exam-type.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent {

  submitted:any=false;
  public valid = true;
  public id;
  constructor(
    private ExamTypeService: ExamTypeService,private route: ActivatedRoute,private router:Router,private fb:FormBuilder, private toastr: Toastr, public CommonService: CommonService
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.examtypecreateform = new FormGroup({
      name: new FormControl('',[Validators.required]),
      status: new FormControl('',[Validators.required]),
      // template_id: new FormControl('',[Validators.required]),
    });
  }

  examtypecreateform: FormGroup;

  templateList:any = [];
  selectedTemplate:any = [];

  ngOnInit() {
    this.ExamTypeService.getTemplateList().subscribe((resp:any) => {
      if(resp.status){
        this.templateList = resp.data
      }
    })
    this.ExamTypeService.getRecord(this.id).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }
      let value = res.data.status.toString();
      this.examtypecreateform.get('name')?.setValue(res.data.name);
      // this.examtypecreateform.get('template_id')?.setValue(res.data.template_id);
      this.examtypecreateform.get('status')?.setValue(value);
      // this.selectedTemplate = res.data.template_id != 0 ? res.data.template_id  : this.templateList[0].id;
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    });      
  }
  URLConstants = URLConstants;

  onSubmit() {
      this.submitted=true;
      this.valid=true;          
      if(this.valid){ //add role
        this.updateRecord(this.examtypecreateform.value);
      }                    
  }    

  updateRecord(payload:any)
  {
    this.ExamTypeService.updateRecord(this.id,payload).subscribe((res:any) => {
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
