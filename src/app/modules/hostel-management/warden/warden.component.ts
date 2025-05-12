import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HostelManagementService } from '../hostel-management.service';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-warden-list',
  templateUrl: './warden.component.html',
  styleUrls: ['./warden.component.scss']
})
export class WardenComponent {
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
    @ViewChild(DataTableDirective, { static: false })
    datatableElement: DataTableDirective | null = null;
  
    tbody: any;
    constructor(
      private HostelManagementService: HostelManagementService,
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      public CommonService: CommonService,
    ) {}
    errors:any = [];
    warden_id:any = '';
    button = 'Submit';


    form = this.fb.group({
      name: ['',[Validators.required]],
      contact_number: ['',[Validators.required,Validators.pattern('[0-9 ]*'),Validators.min(1000000000), Validators.max(9999999999)]],
      address: ['',[Validators.required]],
      status: ['1',[Validators.required]],
    });

    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.warden_id = this.activatedRouteService.snapshot.params['id'];
      if(this.warden_id){
        this.button = 'Update'
        this.HostelManagementService.getWarden(this.warden_id).subscribe((resp:any) => {
          if(resp.status){
            this.form.patchValue({
              name: resp.data.name,
              contact_number: resp.data.contact_number,
              address: resp.data.address,
              status: resp.data.status,
            }); 
          }
        },
        (error:any) => {
          this.toastr.showError('Record not found.')
          this.router.navigate([this.setUrl(URLConstants.WARDEN_LIST)]);  
        })
      }
    }

  
    submit(){
      if(this.warden_id){
        this.HostelManagementService.updateWardenDetail(this.form.value, this.warden_id).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.router.navigate([this.setUrl(URLConstants.WARDEN_LIST)]);  
          }else{
            this.errors = resp.message
            this.toastr.showError('Something went wrong!')
          }   
        })
      }else{
        this.HostelManagementService.createWardenDetail(this.form.value).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.router.navigate([this.setUrl(URLConstants.WARDEN_LIST)]);  
          }else{
            this.errors = resp.message
            this.toastr.showError('Something went wrong!')
          }   
        })
      }
    }
}
