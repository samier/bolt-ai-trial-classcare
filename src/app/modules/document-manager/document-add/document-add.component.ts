import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../../transport-management/transport.service';
import { documentManagerService } from '../document-manager.service';
import { ThumbnailsComponent } from 'src/app/components/elements/thumbnails/thumbnails.component';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-document-add',
  templateUrl: './document-add.component.html',
  styleUrls: ['./document-add.component.scss']
})
export class DocumentAddComponent implements OnInit {

  constructor(
    private fb: FormBuilder, 
    private activatedRouteService: ActivatedRoute,
    private router: Router,
    private toastr: Toastr,
    private documentManagerService: documentManagerService,
    public CommonService: CommonService 
) {}

  document_for:any = null
  URLConstants = URLConstants;
  id:any

  form:any = this.fb.group({
    name: ['',[Validators.required]],
    document_for: [null,[Validators.required]],
    document_type_id: [''],
    document_date: ['',[Validators.required]],
    description: ['',[Validators.required]],
    document_file: [],
    is_published: [false],
  });

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.documentManagerService.getDocumentType(this.id).subscribe((resp:any) => {
        this.form.patchValue({
          name: resp.data.name,
          document_type_id: resp.data.document_type_id,
          document_for: resp.data.document_for,
          document_date: resp.data.document_date.split(" ")[0],
          description: resp.data.description,
          is_published: resp.data.is_publish == 1 ? true : false,
      });  
      })
    }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  submit(){
    const form = document.getElementById('form') as HTMLFormElement;
    const formData:FormData = new FormData(form);
    formData.append('document_date',this.form.value.document_date);
    formData.append('document_for',this.form.value.document_for);
    let is_publish:any = this.form.value.is_published == true ? 1 : 0;
    formData.append('is_publish', is_publish);
    if(!this.id){
      this.documentManagerService.storeDocument(formData).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message);
          this.form.reset();
          this.router.navigate([this.setUrl(URLConstants.DOCUMENT_MANAGER)]);  
        }else{
          this.toastr.showError(resp.message);
        }
      },(err:any) => {
        this.toastr.showError('Something went wrong.');
        console.log("error : ", err);
      });
    }else{
      this.documentManagerService.updateDocument(formData, this.id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message);
          this.form.reset();
          this.router.navigate([this.setUrl(URLConstants.DOCUMENT_MANAGER)]);  
        }else{
          this.toastr.showError(resp.message);
        }
      },(err:any) => {
        this.toastr.showError('Something went wrong.');
        console.log("error : ", err);
      });
    }
    
  }

}
