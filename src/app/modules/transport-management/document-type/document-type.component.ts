import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-document-type',
  templateUrl: './document-type.component.html',
  styleUrls: ['./document-type.component.scss']
})
export class DocumentTypeComponent {

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
  document_type: any = [];

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.saveBtn = 'Update';
      this.page = 'Edit';
      this.transportService.getDocumentTypeDetail(this.id).subscribe((res) => {  
        this.document_type = res;
        this.form.patchValue({
            name: this.document_type.data.name,
            for: this.document_type.data.for,
            status: this.document_type.data.status,
        });  
      });
    }
  }

  form = this.fb.group({
    name: ['',[Validators.required,Validators.pattern(/^[\p{L}\p{M} ]*$/u)]],
    for: ['',[Validators.required]],
    status: ['active'],
  });

  submit(): void{
    if(this.id){
      Object.assign(this.form.value, {id:this.id});
    }
    this.transportService.saveDocumentType(this.form.value,this.id).subscribe((res:any) => {  
      this.toastr.showSuccess(res.message);
      this.router.navigate([this.setUrl(URLConstants.DOCUMENT_TYPE_LIST)]);  
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
