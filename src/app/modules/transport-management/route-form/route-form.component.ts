import { Component } from '@angular/core';
import { CdkDragDrop, CdkDropList, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { CommonService } from 'src/app/core/services/common.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import {isEmpty, cloneDeep} from 'lodash'

@Component({
  selector: 'app-route-form',
  templateUrl: './route-form.component.html',
  styleUrls: ['./route-form.component.scss']
})
export class RouteFormComponent {

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
  vehicles: any = [];
  drivers: any = [];
  attendants: any = [];
  stopsdata: any = [];
  defaultstopsdata: any = [];
  route: any = [];
  id:any = null;
  isSubmitting: boolean = false;
  selectedStopsDD: Array<any> = [];
  stopsDDdata
  stopDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    enableCheckAll: false,
    allowSearchFilter: true
  };

  ngOnInit(): void {
    this.transportService.getVehicles().subscribe(data => {
      this.vehicles = data;
    });
    this.transportService.getDrivers('Driver').subscribe(data => {
      this.drivers = data;
    });
    this.transportService.getDrivers('Attendant').subscribe(data => {
      this.attendants = data;
    });
    this.transportService.getStops().subscribe(data => {
      let stopdata: any = data;
      this.stopsdata = cloneDeep(stopdata.data).map((item:any) => {
        return {...item, disabled: item.is_default === 1}
      });
      this.stopsDDdata = cloneDeep(stopdata.data).filter((item: { is_default: number }) => item.is_default !== 1);
      this.defaultstopsdata = stopdata.data.filter((item: { is_default: number }) => item.is_default === 1);
      this.defaultstopsdata.forEach(defaultstopsdata => {
        if(typeof(this.activatedRouteService.snapshot.params['id']) == 'undefined'){
          let defalutstopobject = this.fb.group({
            id: this.fb.control(''),
            stop_id: this.fb.control({ value: defaultstopsdata.id, disabled: true }, [Validators.required]), // Set disabled to true
            pickup_time: this.fb.control('',[Validators.required]),
            drop_time: this.fb.control('',[Validators.required]),
            order_no: this.fb.control(''),
            is_default: this.fb.control(1),
          });
          this.stopsFieldAsFormArray.push(defalutstopobject);
        }
      });
    });

    this.id = this.activatedRouteService.snapshot.params['id'];
    if(this.id){
      this.saveBtn = 'Update';
      this.page = 'Edit';
      this.transportService.getRouteDetail(this.id).subscribe(data => {
        this.route = data;
        if(this.route.data.vehicle){
          if(this.vehicles.data?.length > 0) {
            this.vehicles.data = [...this.vehicles.data ,this.route.data.vehicle];
          } else {
            this.vehicles.data = [this.route.data.vehicle];
          }
        }
        if(this.route?.data?.driver){
          if(!this.drivers?.data?.some((x:any) => x.id == this.route?.data?.driver.id)){
            this.drivers.data?.push(this.route.data.driver);
          }
        }
        if(this.route.data.attendant){
            this.attendants.data?.push(this.route.data.attendant);
        }
        this.form.patchValue({
            name: this.route.data.name,
            vehicle_id: this.route.data.vehicle ? this.route.data.vehicle_id : '',
            driver_id: this.route.data.driver ? this.route.data.driver_id : '',
            attendant_id: this.route.data.attendant ? this.route.data.attendant_id : '',
            status: this.route.data.status ? this.route.data.status : '',
        });
        this.route.data.stops.forEach((row: any,index: any) => {
            row.is_default = row.stop.is_default;
            delete row.stop;
            delete row.route_id;
            this.addControl();
            const stopsControl = this.form.get('stops');
            if (stopsControl && stopsControl.get(index.toString())) {
              const stopIdControl = stopsControl.get(index.toString())?.get('stop_id');
              if (stopIdControl && row.is_default == 1) {
                stopIdControl.disable();
              }
            }
        });
        this.form.get("stops")?.setValue(this.route.data.stops ? this.route.data.stops : []);
        this.updateSelectedStopData(this.route.data.stops);
      });
    }
  }

  form = this.fb.group({
    name: ['',[Validators.required]],
    vehicle_id: [null,[Validators.required]],
    driver_id: [null],
    attendant_id: [''],
    status: ['active',[Validators.required]],
    stops: this.fb.array([]),
  });

  get stopsFieldAsFormArray(): any {
    return this.form.get('stops') as FormArray;
  }

  get_stop_id(i:number): any {
    return this.stopsFieldAsFormArray.controls?.[i]?.controls?.stop_id;
  }

  get_pickup_time(i:number): any {
    return this.stopsFieldAsFormArray.controls?.[i]?.controls?.pickup_time;
  }

  get_drop_time(i:number): any {
    return this.stopsFieldAsFormArray.controls?.[i]?.controls?.drop_time;
  }

  stop(data?: any) {
    return this.fb.group({
      id: this.fb.control(''),
      stop_id: this.fb.control(data?.id ? data?.id : null , [Validators.required]),
      pickup_time: this.fb.control('',[Validators.required]),
      drop_time: this.fb.control('',[Validators.required]),
      order_no: this.fb.control(''),
      is_default:this.fb.control(0),
    });
  }

  addControl(): void {
    this.stopsFieldAsFormArray.push(this.stop());
  }

  route_stop_id: any;
  remove(i: number): void {
    this.route_stop_id = this.stopsFieldAsFormArray.controls?.[i]?.controls?.id.value;
    if(this.route_stop_id){
        this.transportService.deleteRouteStop(this.route_stop_id).subscribe(data => {
          console.log(data);
        });
    }
    this.stopsFieldAsFormArray.removeAt(i);
    this.updateSelectedStopData(this.form.value.stops)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    this.addControl();
    this.remove(this.stopsFieldAsFormArray.length-1);
  }

  submit(): void{
    this.isSubmitting = true;
    const stopsArray = this.form.get('stops') as FormArray;
    stopsArray.controls.forEach((control) => {
      if (control.get('stop_id')?.disabled) {
        control.get('stop_id')?.enable();
      }
    });
    Object.assign(this.form.value, {id:this.id});
    this.form?.value?.stops?.map((row:any,index:any)=>{
      return row.order_no = index+1;
    })
    this.transportService.saveRoute(this.form.value,this.id).subscribe((res:any) => {  
      this.toastr.showSuccess(res.message);
      this.router.navigate([this.setUrl(URLConstants.ROUTE_LIST)]); 
      this.isSubmitting = false; 
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      this.isSubmitting = false;
    }); 
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  onStopSelect(stop) {
    let inx = this.stopsFieldAsFormArray.value.findIndex((sData) => sData.stop_id === stop.id);
    if(inx < 0) {
      this.stopsFieldAsFormArray.push(this.stop(stop));
      this.updateStopDataState()
    }
  }

  onStopDeSelect(stop) {
    let inx = this.stopsFieldAsFormArray.value.findIndex((sData) => sData.stop_id === stop.id);
    if(inx > -1) {
      this.stopsFieldAsFormArray.removeAt(inx);
      this.updateStopDataState()
    }
  }

  onDisaledStopClick(item) {
    if(item.disabled) {
      this.toastr.showError('Stop already added!');
    }
  }

  updateStopDataState = () => {
    const selIds = this.selectedStopsDD.map((s) => s.id)
    let updatedStops = cloneDeep(this.stopsdata).map((sData) => {
      return {...sData, disabled:  selIds.includes(sData.id) || sData?.is_default === 1}
    })
    this.stopsdata = updatedStops
  }

  updateSelectedStopData = (stops) => {
    const selStops = stops || [];
    this.selectedStopsDD = [...selStops.map((s: any) => {
      const sItem = this.stopsDDdata.find(data => data.id === s.stop_id)
      return !isEmpty(sItem) ? {
        id: sItem.id,
        name: sItem.name
      } : {}
    }).filter((f) => !isEmpty(f))]
  }

  onStopFieldSelect() {
    this.updateSelectedStopData(this.form.value.stops)
    this.updateStopDataState()
  }

  addSingleStop(i: number) {
    this.stopsFieldAsFormArray.push(this.stop());
  }
}
