import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HostelManagementService } from '../hostel-management.service';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-hostel-list',
  templateUrl: './hostel.component.html',
  styleUrls: ['./hostel.component.scss']
})
export class HostelComponent {
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
    ) {}
    errors:any = [];
    hostel_id:any = '';
    button = 'Submit';
    wardens = [];

    form = this.fb.group({
      name: ['',[Validators.required]],
      warden_id: ['',[Validators.required]],
      address: ['',[Validators.required]],
      description: ['',[Validators.required]],
      status: ['1',[Validators.required]],
    });

    setUrl(url:string) {
      return '/'+window.localStorage.getItem("branch")+'/'+url;
    }
    
    ngOnInit() {
      this.getWardenList();
      this.hostel_id = this.activatedRouteService.snapshot.params['id'];
      if(this.hostel_id){
        this.button = 'Update'
        this.HostelManagementService.getHostel(this.hostel_id).subscribe((resp:any) => {
          if(resp.status){
            this.form.patchValue({
              name: resp.data.name,
              warden_id: resp.data.warden_id,
              address: resp.data.address,
              description: resp.data.description,
              status: resp.data.status,
            }); 
          }
        },
        (error:any) => {
          this.toastr.showError('Record not found.')
          this.router.navigate([this.setUrl(URLConstants.HOSTEL_LIST)]);  
        })
      }
    }

    getWardenList(){
      this.HostelManagementService.getWardenDropdownList().subscribe((resp:any) => {
        if(resp.status){
          this.wardens = resp.data
        }
      })
    }

  
    submit(){
      if(this.hostel_id){
        this.HostelManagementService.updateHostelDetail(this.form.value, this.hostel_id).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.router.navigate([this.setUrl(URLConstants.HOSTEL_LIST)]);  
          }else{
            this.errors = resp.message
            this.toastr.showError('Something went wrong!')
          }   
        })
      }else{
        this.HostelManagementService.createHostelDetail(this.form.value).subscribe((resp:any) => {
          if(resp.status){
            this.toastr.showSuccess(resp.message)
            this.router.navigate([this.setUrl(URLConstants.HOSTEL_LIST)]);  
          }else{
            this.errors = resp.message
            this.toastr.showError('Something went wrong!')
          }   
        })
      }
    }
}
