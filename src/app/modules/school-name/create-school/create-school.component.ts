import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { SchoolNameService } from '../school-name.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-create-school',
  templateUrl: './create-school.component.html',
  styleUrls: ['./create-school.component.scss']
})
export class CreateSchoolComponent implements OnInit {

  submitted:any=false;
  public valid = true;  
  selectedImage: any;
  public id:any;
  errors:any;
  public total_size:number=0;
  public file_size_array:string[]=[];

  constructor(private schoolNameService: SchoolNameService,private router:Router,private toastr: Toastr,private route: ActivatedRoute, public CommonService: CommonService) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.leavecreateform = new FormGroup({      
      image: new FormControl(''),
      school_name: new FormControl('',[Validators.required]),
      location: new FormControl('',[Validators.required]),
      contact: new FormControl('',[Validators.required,Validators.pattern(/^[0-9]{10}$/)]),
      secondContact: new FormControl('',[Validators.pattern(/^[0-9]{10}$/)]),
      address: new FormControl('',[Validators.required]),
      city: new FormControl('',[Validators.required]),
      udiseNo: new FormControl(''),
      sscIndexNo: new FormControl(''),
      hscIndexNo: new FormControl(''),      
      trust_name: new FormControl(''),      
      affiliation_no: new FormControl(''),      
    });
   }
  URLConstants = URLConstants;
  leavecreateform: FormGroup;


  ngOnInit(): void {
  }

  onImageChangeFromFile($event:any){
    if ($event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];      
      this.selectedImage = file;
      
      let file_size = file.size;
      this.errors="";
        if(file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/png") {
              
        }
        else {      
          this.get_document().reset();
          this.errors="Can not upload "+file.type+" file type. Please upload jpg,png,jpeg files only.";
          file_size=0;
        }
        if(file.size > 2048000){
          this.get_document().reset();       
          this.errors="File size more than 2 mb. Please upload file with size 2mb or less";
          file_size=0;
        }
        this.file_size_array[0]=file.size;
        this.total_size = this.total_size + parseInt(file_size);
        if(this.total_size > 6144000){
          this.get_document().reset();       
          this.errors="You exceding upload limit. Please upload it in second edit round.";
        }
        
    }
  }

  get_document(): any {
    return this.documentFieldAsFormArray.controls?.controls?.document;
}

get documentFieldAsFormArray(): any {
  return this.leavecreateform.get('image') as FormArray;
}

  onSubmit() {
    this.submitted=true;
    this.valid=true;        
    const forms = document.getElementById('form') as HTMLFormElement;    
    
    const formData:FormData = new FormData(forms);  
    formData.append("id",this.id);
    formData.append("name",this.leavecreateform.value.school_name);
    formData.append("contactNo",this.leavecreateform.value.contact);
    formData.append("secondContactNo",this.leavecreateform.value.secondContact);
    formData.append("is_school",'1');
    
    if(this.valid){  
      this.schoolNameService.addSchool(formData).subscribe((res:any) => {
        
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.router.navigate([this.setUrl(URLConstants.LIST_SCHOOL)]);
        } 
      });
    }
    
    return 0;
}

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
