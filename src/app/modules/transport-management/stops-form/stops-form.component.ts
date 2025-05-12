import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { CommonService } from 'src/app/core/services/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LocationPickerComponent } from 'src/app/modules/transport-management/location-picker/location-picker.component';

@Component({
  selector: 'app-stops-form',
  templateUrl: './stops-form.component.html',
  styleUrls: ['./stops-form.component.scss']
})
export class StopsFormComponent {
  locationPicker$:any;
  
  constructor(
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private transportService: TransportService,
      public CommonService: CommonService,
      private modalService: NgbModal,
  ) {}

  URLConstants = URLConstants;
  saveBtn:string = 'Save';
  page:string = 'Add';
  id:any = null;
  stop: any = [];
  areas:any = [];

  ngOnInit(): void {
    this.getAreas();
    this.locationPicker();
    this.id = this.activatedRouteService.snapshot.params['id'];
      if(this.id){
        this.saveBtn = 'Update';
        this.page = 'Edit';
        this.transportService.getStopDetail(this.id).subscribe((res) => {  
          this.stop = res;
          this.form.patchValue({
              name: this.stop.data.name,
              distance: this.stop.data.distance,
              fare: this.stop.data.fare,
              latitude: this.stop.data.latitude,
              longitude: this.stop.data.longitude,
              area: this.stop.data?.area.length > 0 ? this.stop.data?.area : []
          });  
      });
    }
  }
  ngOnDestroy(): void {
    this.locationPicker$.unsubscribe();
  }

  form = this.fb.group({
    name: ['', [Validators.required]],
    distance: ['', [Validators.pattern('[0-9.]*')]],
    fare: ['',[Validators.required,Validators.pattern('[0-9.]*')]],
    latitude: ['',[Validators.required,Validators.pattern('[0-9.-]*')]],
    longitude: ['',[Validators.required,Validators.pattern('[0-9.-]*')]],
    area: [null]
  });
  pickLocation(){
    const modalRef = this.modalService.open(LocationPickerComponent,{
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.lat = this.stop.data ? parseFloat(this.stop.data.latitude) : null;
    modalRef.componentInstance.lng = this.stop.data ? parseFloat(this.stop.data.longitude) : null;
}

locationPicker(){
  this.locationPicker$ = this.transportService.locationPicker$.subscribe((response:any)=>{
    this.form.patchValue({
      latitude: response.lat,
      longitude: response.lng
    });  
  })
}
  submit(): void{
    Object.assign(this.form.value, {id:this.id});
    this.transportService.saveStop(this.form.value,this.id).subscribe((res:any) => {  
      if(res.status){
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.STOPS_LIST)]);  
      }else{
        this.toastr.showError(res.message);
      }
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }

  getAreas(){
    this.transportService.AreaList().subscribe((resp:any) => {
      this.areas = resp.data.transportAreaList
    })
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
