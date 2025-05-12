import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { CommonService } from 'src/app/core/services/common.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss']
})
export class VehicleComponent {

  constructor(
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private transportService: TransportService,
      public CommonService: CommonService , 
      private validationService: FormValidationService,
  ) {}

  URLConstants = URLConstants;
  saveBtn:string = 'Save';
  page:string = 'Add';
  vehicle_id:any = null;
  vehicle: any = [];
  document_types: any = [];
  is_loading : boolean = false

  ngOnInit(): void {
    this.transportService.getDocumentTypes('vehicle').subscribe((res:any) => {  
      this.document_types = res;
    });
    this.vehicle_id = this.activatedRouteService.snapshot.params['id'];
      if(this.vehicle_id){
        this.saveBtn = 'Update';
        this.page = 'Edit';
        this.transportService.getVehicleDetail(this.vehicle_id).subscribe((res) => {  
          this.vehicle = res;
          this.form.patchValue({
              vehicle_no: this.vehicle.data.vehicle_no,
              reg_no: this.vehicle.data.reg_no,
              owning_type: this.vehicle.data.owning_type??'',
              vehicle_type: this.vehicle.data.vehicle_type??'',
              no_of_seats: this.vehicle.data.no_of_seats,
              fuel_type: this.vehicle.data.fuel_type??'',
              status: this.vehicle.data.status,
          });  
        this.vehicle.data.documents.forEach((row: any,index: any) => {
          delete row.vehicle_id;
          row.document_type = row.document_type.name;
          this.addDocument();
        });
        this.documentFieldAsFormArray.setValue(this.vehicle.data.documents);
      });
    }
  }

  form = this.fb.group({
    vehicle_no: ['',[Validators.required,Validators.pattern('[a-zA-Z0-9 ]*')]],
    reg_no: ['',[Validators.pattern('[a-zA-Z0-9 ]*')]],
    owning_type: [''],
    vehicle_type: [''],
    no_of_seats: ['',[Validators.required,Validators.pattern("^[0-9]*$"),Validators.min(1)]],
    fuel_type: [''],
    status: ['active',[Validators.required]],
    documents: this.fb.array([]),
  });

  get documentFieldAsFormArray(): any {
      return this.form.get('documents') as FormArray;
  }

  get_document_type(i:any): any {
      return this.documentFieldAsFormArray.controls?.[i]?.controls?.document_type_id;
  }

  get_document(i:any): any {
      return this.documentFieldAsFormArray.controls?.[i]?.controls?.document;
  }

  // FOR START DATE 
  get_startDate(i:any): any {
    return this.documentFieldAsFormArray.controls?.[i]?.controls?.start_date;
  }
  // FOR END DATE
  get_endDate(i:any): any {
    return this.documentFieldAsFormArray.controls?.[i]?.controls?.end_date;
  }

  get_document_url(i:any): any {
      return this.documentFieldAsFormArray.controls?.[i]?.controls?.document_url.value;
  }

  document(): any {
    return this.fb.group({
        id: this.fb.control(''),
        document_type_id: this.fb.control('',[Validators.required]),
        document: this.fb.control('',[Validators.required]),
        document_url: this.fb.control(''),
        document_type: this.fb.control(''),

        start_date :  this.fb.control( '' , [Validators.required] ),
        end_date   :  this.fb.control( '' , [Validators.required] ),
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
      });
    }
    this.documentFieldAsFormArray.removeAt(i);
  }

  submit(): void{

    if(this.form.invalid){
      this.validationService.getFormTouchedAndValidation(this.form)
      this.documentFieldAsFormArray.controls.forEach((ele)=>{
        this.validationService.getFormTouchedAndValidation(ele)
      })
      this.toastr.showError("Please fill all the required field")
      return
    }
    this.is_loading = true
    const form = document.getElementById('vehicle-form') as HTMLFormElement;
    const formData:FormData = new FormData(form);
    formData.append('id',this.vehicle_id);
    this.transportService.saveVehicle(formData,this.vehicle_id).subscribe((res:any) => {  
      this.toastr.showSuccess(res.message);
      this.is_loading = false
      this.router.navigate([this.setUrl(URLConstants.VEHICLE_LIST)]);  
    },(err:any)=>{
      this.is_loading = false
      this.toastr.showError(err.error.message);
    }); 
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
