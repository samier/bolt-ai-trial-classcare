import { Component, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/core/services/common.service';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import {Toastr} from   'src/app/core/services/toastr';
import { StudentService } from '../student.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-document-tab',
  templateUrl: './document-tab.component.html',
  styleUrls: ['./document-tab.component.scss']
})
export class DocumentTabComponent implements OnInit {
  sections: any;
  classes: any;

  selectedFile: File | null = null;

  uniqueId! :any

  documentList : any = []

  is_docLoading : boolean = false

  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  documentForm:FormGroup = new FormGroup({})

  constructor(
    private modalService: NgbModal,
    public commonService: CommonService,
    private fb: FormBuilder,
    private toaster : Toastr,
    private studentService : StudentService,
    private _activatedRoute:ActivatedRoute,
    private validationService: FormValidationService,
    public  dateFormateService : DateFormatService,
  ) { }

  ngOnInit(): void {
    this.formInit()
    this._activatedRoute.params.subscribe(params => {
      this.uniqueId = params['id'] || params['unique_id'];
    });
    this.getDocument()
  }
  openVerticallyCentered(filterMdl: TemplateRef<any>) {
    this.modalService.open(filterMdl, { centered: true, windowClass: "filter-modal" });
  }
  
  close(){
    this.documentForm?.controls['name']?.patchValue('')
    this.documentForm?.controls['attachment']?.patchValue(null)
    this.selectedFile = null
    this.is_docLoading = false
    this.modalService.dismissAll()
  }

  onFileSelect(event: any): void {
    this.selectedFile= null
    this.documentForm.controls['attachment'].patchValue([])
    
    if (event.target?.files?.length > 0) {
      this.selectedFile = event.target?.files[0];
      if(this.selectedFile){
        this.documentForm.controls['attachment'].patchValue(this.selectedFile)
      }
    }
    this.documentForm.get('attachment')?.updateValueAndValidity();
  }

  getDocument(){
    this.studentService.getDocumentList(this.uniqueId).subscribe((res:any)=>{
      if(res?.status){
        this.documentList = []
        this.documentList = res?.data
        this.documentList?.forEach((obj:any)=>{
          obj['attachment_url'] =this.correctUrl(obj?.attachment_url)
        })
      }
    },(error:any)=>{

    })
  }

  handleSave(): void {

    if(this.documentForm.invalid){
      this.validationService.getFormTouchedAndValidation(this.documentForm)
      this.toaster.showError("Please fill all the required field")
      return
    }
    if (this.documentForm?.valid && this.selectedFile) {
      this.is_docLoading = true
      const formData = new FormData();
      formData.append('branch_id', this.branch_id );
      formData.append('unique_id', this.uniqueId );
      formData.append('name', this.documentForm.get('name')?.value);
      formData.append('attachment', this.selectedFile);

      this.studentService.documentAdd(formData).subscribe((res:any)=>{

        if(res?.status){
          this.getDocument()
          this.toaster.showSuccess(res?.message)
          this.close()
        }
        else{
          this.is_docLoading = false
          this.toaster.showError(res.message)
        }
      },(error:any)=> {
        this.is_docLoading = false
        this.toaster.showError(error?.error?.errors?.attachment?.[0] ?? error?.message);
      })
    }
  }

  correctUrl(url) {
    if (url.startsWith('httpss')) {
        return url.replace('httpss', 'https');
    }
    return url; 
  }

  isPdf(url: string): boolean {
    return url?.toLowerCase().endsWith('.pdf');
  }

  getFileType(url: string): string {
    if (!url) return 'unknown';
  
    const extension :any= url.split('.').pop()?.toLowerCase();
  
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    } else {
      return 'other';
    }
  }
  
  deleteDocument(item:any){

    const wantToDelete = confirm(`Are You Sure ,You want to delete ${item?.document_name} Document`)
    if(!wantToDelete) return 

    this.studentService.deleteDocument(item?.id).subscribe((res:any)=>{ 
      if(res?.status){
        this.toaster.showSuccess(res?.message)
        this.getDocument()
      }
    } ,(error:any)=>{

    })
  }

  formInit(){
    this.documentForm = this.fb.group({
      name       : ['' , [ Validators.required ] ],
      attachment: [null, Validators.required]
    })
  }

}
