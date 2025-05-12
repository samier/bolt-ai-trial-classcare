import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-driver-form',
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.scss']
})
export class DriverFormComponent {

  constructor(
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private transportService: TransportService,
public CommonService: CommonService
  ) {}

  URLConstants = URLConstants;
  saveBtn:string = 'Save';
  page:string = 'Add';
  id:any = null;
  driver: any = [];
  document_types: any = [];

  ngOnInit(): void {
    this.transportService.getDocumentTypes('driver').subscribe((res:any) => {  
      this.document_types = res;
    });
    this.id = this.activatedRouteService.snapshot.params['id'];
      if(this.id){
        this.saveBtn = 'Update';
        this.page = 'Edit';
        this.transportService.getDriverDetail(this.id).subscribe((res) => {  
          this.driver = res;
          this.form.patchValue({
              name: this.driver.data.name,
              contact_no_1: this.driver.data.contact_no_1,
              contact_no_2: this.driver.data.contact_no_2,
              whatsapp_no: (this.driver.data.whatsapp_no == this.driver.data.contact_no_1 ? "contact_no_1" : "contact_no_2"),
              current_address: this.driver.data.current_address,
              same_address: this.driver.data.current_address == this.driver.data.permanent_address ? "Yes" : "No",
              permanent_address: this.driver.data.permanent_address,
              type: this.driver.data.type,
              status: this.driver.data.status,
          });  
        this.driver.data.documents.forEach((row: any,index: any) => {
          delete row.driver_id;
          row.document_type = row.document_type.name;
          this.addDocument();
        });
        this.documentFieldAsFormArray.setValue(this.driver.data.documents);
      });
    }
  }

  form = this.fb.group({
    name: ['',[Validators.required,Validators.pattern(/^[\p{L}\p{M} ]*$/u)]],
    contact_no_1: ['',[Validators.required,Validators.pattern('[0-9 ]*'),Validators.min(1000000000), Validators.max(9999999999)]],
    contact_no_2: ['',[Validators.required,Validators.pattern('[0-9 ]*'),Validators.min(1000000000), Validators.max(9999999999)]],
    whatsapp_no: ['',[Validators.required]],
    current_address: ['',[Validators.required]],
    same_address: ['No'],
    permanent_address: ['',[Validators.required]],
    type: ['',[Validators.required]],
    status: ['active',[Validators.required]],
    documents: this.fb.array([]),
  });

  same_address(condition:string):any {
    if (condition == "No") {
      this.form.controls['permanent_address'].setValidators([Validators.required]);
    } else {
      this.form.controls['permanent_address'].clearValidators();
    }
    this.form.controls['permanent_address'].updateValueAndValidity();
  }

  get documentFieldAsFormArray(): any {
      return this.form.get('documents') as FormArray;
  }

  get_document_type(i:any): any {
      return this.documentFieldAsFormArray.controls?.[i]?.controls?.document_type_id;
  }

  get_document(i:any): any {
      return this.documentFieldAsFormArray.controls?.[i]?.controls?.document;
  }

  get_document_url(i:any): any {
      return this.documentFieldAsFormArray.controls?.[i]?.controls?.document_url.value;
  }

  get_same_address(): any {
      return this.form.value.same_address === 'No';
  }

  document(): any {
    return this.fb.group({
        id: this.fb.control(''),
        document_type_id: this.fb.control('',[Validators.required]),
        document: this.fb.control('',[Validators.required]),
        document_url: this.fb.control(''),
        document_type: this.fb.control(''),
    });
  }

  addDocument(): void {
    this.documentFieldAsFormArray.push(this.document());
  }

  document_type_id: any;
  remove(i: number): void {
    this.document_type_id = this.documentFieldAsFormArray.controls?.[i]?.controls?.id?.value;
    if(this.document_type_id){
      this.transportService.deleteVehicleDocument(this.document_type_id).subscribe(data => {
        console.log(data);
      });
    }
    this.documentFieldAsFormArray.removeAt(i);
  }

  submit(): void{
    const form = document.getElementById('driver-form') as HTMLFormElement;
    const formData:FormData = new FormData(form);
    formData.append('id',this.id);
    if(!this.get_same_address()){
      formData.append('permanent_address',this.form?.value?.current_address??"");
    }
    this.transportService.saveDriver(formData,this.id).subscribe((res:any) => {  
      this.toastr.showSuccess(res.message);
      this.router.navigate([this.setUrl(URLConstants.DRIVER_LIST)]);  
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
