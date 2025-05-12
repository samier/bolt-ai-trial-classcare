import { Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { param } from 'jquery';
import { CommonService } from 'src/app/core/services/common.service';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-assign-transport-form',
  templateUrl: './assign-transport-form.component.html',
  styleUrls: ['./assign-transport-form.component.scss']
})
export class AssignTransportFormComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  form:FormGroup = new FormGroup({})
  constructor(
      private fb: FormBuilder, 
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private transportService: TransportService,
      public CommonService: CommonService,
      private modalService: NgbModal,
      public  dateFormateService : DateFormatService,
  ) {}

  URLConstants = URLConstants;
  saveBtn:string = 'Save';
  page:string = 'Add';
  id:any = null;
  assign_transport: any = [];
  sections= [{ id: '', name: 'All' }];
  classes: any = [];
  batches: any = [];
  students: any = [];
  employees: any = [];
  routes: any = [];
  pickup_stands: any = [];
  drop_stands: any = [];
  selectedSection: any ;
  selectedBatches: any = [];
  selectedClasses: any = [];
  selectedStudents: any = [];
  selectedEmployees: any = [];
  selectedPickupRoute: any = null;
  selectedPickupStand: any = null;
  selectedDropRoute: any = null;
  selectedDropStand: any = null;
  classDropdownSettings: IDropdownSettings = {};
  fare:any = 0;
  total_fare:number = 0;
  warning:string = '';
  pickupRoute:any = [];
  dropRoute:any = [];
  academicYear:any = [];
  section:any;
  assign_transport_history:any = [];
  for:any = null;
  calculation_type:any;
  attachmentList:any = [];
  modelAttachments:any = [];
    send_father = false
    send_mother = false
    send_student = false

  areas:any = []
  stops:any;

  type:any='student'

  defaultAttachment = [
    {attachment_name: 'Transport Cancellation Form', attachment: null},
  ];

  fileIcons:any = {
    "pdf" : './assets/img/files/file.png',
    "png" : './assets/img/files/image.png',
    "jpg" : './assets/img/files/image.png',
    "jpeg" : './assets/img/files/image.png',
    "gif" : './assets/img/files/image.png',
    "webp" : './assets/img/files/image.png',
  };


  section_select:any = [];
  transport_modes:any = [
    {name:"Two Way Transport",value:"two way transport"},
    {name:"One Way Pickup",value:"one way pickup"},
    {name:"One Way Drop",value:"one way drop"}
  ];
  is_loading : boolean = false

  

  initialize(){
    this.dtOptions = {
     columns: [
        { data: 'id' },
        { data: 'student' }, 
        { data: 'employee' }, 
        { data: 'transport_mode' }, 
        { data: 'pickup_route' }, 
        { data: 'pickup_stand' }, 
        { data: 'drop_route' }, 
        { data: 'drop_stand' }, 
        { data: 'start_date' }, 
        { data: 'end_date' }, 
        { data: 'fare' },
        { data: 'transport_status',orderable: false },
        { data: 'reason' },
        { data: 'Detail', orderable: false },
        { data: 'action' },
      ]
    };
  }

  ngOnInit(): void {
    this.formInit();
    console.log(this.form);
    
    this.transportService.systemSetting('fees_calculation_type').subscribe((res: any) => {             
      // value 0 = day wise calculation
      // value 1 = month wise calculation
      this.calculation_type = res
    });
    this.transportService.getSectionList(this.sections).subscribe((res: any) => {             
      this.sections = this.sections.concat(res.data);        
    });
    this.getAreaList();
    if(!this.id){
      this.getStops()
    }
    
    this.id = this.activatedRouteService.snapshot.params['id'];
    if(!this.id){
      this.defaultAttachment.forEach((ele => {
        this.addAttachment(ele);
      }))
      this.transportService.getClassList(this.form.value.section).subscribe((res) => {
        this.classes = res;
      }); 
      this.transportService.getEmployeeList().subscribe((res) => {
        this.employees = res;
      });
    } 
    this.transportService.getAcademicYear().subscribe((res:any) => {
      this.academicYear = res.data;
    }); 
    // this.getAvailableRoutes();
    if(this.id){
      this.saveBtn = 'Update';
      this.page = 'Edit';
      this.transportService.getAssignTransportDetail(this.id).subscribe((res) => {  
        this.assign_transport = res;
        this.getStops(this.assign_transport.data.area_id)
        this.for = this.assign_transport.data.for
        this.assign_transport_history = this.assign_transport.data.transport_history
        this.selectedSection = this.assign_transport.data?.section?.id ?? "";        
        this.selectedClasses.push(this.assign_transport.data.class ?? {});
        this.selectedBatches.push(this.assign_transport.data.batch ?? {});
        if(this.assign_transport.data.student){
          this.selectedStudents.push({
            'id': this.assign_transport.data.student.id,
            'name': this.assign_transport.data.student.full_name
          });
        }
        if(this.assign_transport.data.employee){
          this.selectedEmployees.push({
            'id': this.assign_transport.data.employee.id,
            'name': this.assign_transport.data.employee.full_name
          });
        }

        this.getRouteByStop(this.assign_transport.data.pickup_stand, 'pickup', this.assign_transport.data);
        this.getRouteByStop(this.assign_transport.data.drop_stand, 'drop', this.assign_transport.data);
        
        if(this.assign_transport.data?.transport_mode != 'one way drop' && this.assign_transport.data?.pickup_route?.status == "inactive"){
          this.warning += 'pickup route';
        }
        if(this.assign_transport.data?.transport_mode != 'one way pickup' && this.assign_transport.data?.drop_route?.status == "inactive"){
          this.warning += this.warning ? ' and drop route' : 'drop route';
        }
        if(this.warning){
          this.warning += ' is currently inactive or removed please select different if you wish to..';
        }

        this.form.patchValue({
          for: this.assign_transport.data.for,
          section: this.selectedSection,
          classes: this.selectedClasses,
          batches: this.selectedBatches,
          students: this.selectedStudents,
          transport_mode: this.assign_transport.data.transport_mode,
          area_id: this.assign_transport.data.area_id,
          pickup_stand: this.assign_transport.data.pickup_stand?.id,
          pickup_route: this.assign_transport.data.pickup_route?.id,
          drop_stand: this.assign_transport.data.drop_stand?.id,
          drop_route: this.assign_transport.data.drop_route?.id,
          fare: this.assign_transport.data.fare,
          start_date: this.assign_transport.data.start_date,
          end_date: this.assign_transport.data.end_date,
          reason: this.assign_transport.data.reason,
      }); 
        this.attachmentList = this.assign_transport.data.transport_attachments
        if(this.attachmentList.length == 0){
          this.defaultAttachment.forEach((ele => {
            this.addAttachment(ele);
          }))
        }else{
          this.addAttachment();
        }

        setTimeout(() => {
          // if(this.assign_transport?.data?.pickup_route?.status == "active"){
          //   this.get_pickup_stand(this.assign_transport.data.pickup_route?.id);
          // }
          // else if(this.assign_transport.data?.transport_mode != 'one way drop'){
          //   this.warning += 'pickup route';
          // }
          // if(this.assign_transport?.data?.drop_route?.status == "active"){
          //   this.get_drop_stand(this.assign_transport.data.drop_route?.id);
          // }
          // else if(this.assign_transport.data?.transport_mode != 'one way pickup'){
          //   this.warning += this.warning ? ' and drop route' : 'drop route';
          // }
          // if(this.warning){
          //   this.warning += ' is currently inactive or removed please select different if you wish to..';
          // }

          this.get_transport_mode(this.assign_transport?.data?.transport_mode);
        }, 500);
         
        
        this.form.controls['for']?.disable();
        // this.form.controls.classes?.disable();
        // this.form.controls.batches?.disable();
        // this.form.controls.students?.disable();
        this.form.controls['employees']?.disable();
      });
    }

    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  getAreaList(){
    this.transportService.AreaList().subscribe((resp:any) => {
      if(resp.status){
        this.areas = resp.data.transportAreaList;
      }
    })
  }

  handleAreaChange(){
    this.form?.get('pickup_route')?.setValue(null);
    this.form?.get('pickup_stand')?.setValue(null);
    this.form?.get('drop_route')?.setValue(null);
    this.form?.get('drop_stand')?.setValue(null);
    this.getStops();
  }

  getStops(id?:any){
    let data = {
      area_id: id ?? this.form.value.area_id
    }
    this.transportService.getStops(data).subscribe((resp:any) => {
      if(resp.status){
        this.stops = resp.data;
      }
    })
  }

  getRouteByStop(event:any, type:any, data?:any){
    this.transportService.getRouteByStop({stop_id:event?.id}).subscribe((response:any)=>{
      if(response.status){
        if(type == 'pickup'){
          this.form?.get('pickup_route')?.setValue(null);
          this.pickupRoute = response.data
          if(data){
            this.form?.get('pickup_route')?.setValue(data?.pickup_route?.id)
          }
        }

        if(type == 'drop'){
          this.form?.get('drop_route')?.setValue(null);
          this.dropRoute = response.data
          if(data){
            this.form?.get('drop_route')?.setValue(data?.drop_route?.id)
          }
        }
        this.get_fare()
      }
    });
  }

  sectionChange()
  { 
      this.transportService.getClassList(this.form.value.section).subscribe((res: any) => {
      this.classes = res;
      this.selectedClasses = [];
      this.selectedBatches = [];
      this.selectedStudents = [];
      this.onClassSelect();
    });
  }

  class_array:any = [];
  onClassSelect() {
    setTimeout(()=>{
      this.class_array = this.form.value.classes;
      let ids = this.class_array.map((item:any) => item.id);
      this.transportService.getBatchesList({'classes':ids}).subscribe(res=>{
        this.batches = res;  
        this.selectedBatches = [];
        this.selectedStudents = [];      
      });
    },100);
  }

  batch_array:any = [];
  onBatchSelect() {
    setTimeout(()=>{
      this.batch_array = this.form.value.batches;
      let ids = this.batch_array.map((item:any) => item.id);
      this.transportService.getStudentList({'batches':ids}).subscribe(res=>{
        this.students = res;
        this.selectedStudents = [];
      });
    },100);
  }

  onStudentEmployeeSelect(){
    setTimeout(()=>{
      this.get_pickup_stand(this.selectedPickupRoute);
      this.get_drop_stand(this.selectedDropRoute);
    },100);
  }

  validateRoute(route:number,type:string){
    var data:any = [];
    if(route){
      if(type == 'pickupRoute'){
        data = this.pickupRoute.filter((item:any) =>{ return item.id == route });
      }else{
        data = this.dropRoute.filter((item:any) =>{ return item.id == route });
      }
      if(this.form.value.for == "student" || this.assign_transport?.data?.for == "student"){
        if(this.selectedStudents.length > data[0].available){
          return false;
        }
      }else{
        if(this.selectedEmployees.length > data[0].available){
          return false;
        }
      }
    }
    return true;
  }
  
  get_pickup_stand(route:any){
    if(!this.validateRoute(route,'pickupRoute')){
      alert('pickup route vehicle doesn\'t have enough seats available. please select different route');
      this.selectedPickupRoute = null;
      this.pickup_stands = [];
      this.selectedPickupStand = null;
    }else{
      // if(route){
      //   this.transportService.getRouteDetail(route).subscribe(data=>{
      //     this.pickup_stands = data;
      //     if(this.assign_transport?.data?.pickup_stand){
      //       this.selectedPickupStand = this.assign_transport.data.pickup_stand?.id;
      //     }
      //   });
      // }
    }
  }

  get_drop_stand(route:any){
    if(!this.validateRoute(route,'dropRoute')){
      alert('drop route vehicle doesn\'t have enough seats available. please select different route');
      this.selectedDropRoute = null;
      this.drop_stands = [];
      this.selectedDropStand = null;
    }else{
      // if(route){
      //   this.transportService.getRouteDetail(route).subscribe(data=>{
      //     this.drop_stands = data;
      //     if(this.assign_transport?.data?.drop_stand){
      //       this.selectedDropStand = this.assign_transport.data.drop_stand?.id;
      //     }
      //   });
      // }
    }
  }

  getAvailableRoutes(){
    this.transportService.getAvailableRoutes({transport_id:this.id}).subscribe((res:any)=>{
      this.pickupRoute = res.data.pickupRoute;
      this.dropRoute = res.data.dropRoute;
    });
  }

  get_fare(){
    this.total_fare = 0;
    if(this.form.value.transport_mode != 'one way drop' && this.form.value.pickup_stand){
      var onject = this.stops.find((o:any) => o.id == this.form.value.pickup_stand);
      this.total_fare += onject.fare;
    }
    if(this.form.value.transport_mode != 'one way pickup' && this.form.value.drop_stand){
      var onject = this.stops.find((o:any) => o.id == this.form.value.drop_stand);
      this.total_fare += onject.fare;
    }
    this.getCalculatedFair();
  }

  getCalculatedFair(){
    const AYstartTime = this.academicYear.start_time;
    const AYendTime = this.academicYear.end_time;
    const startDate = new Date(AYstartTime);
    const endDate = new Date(AYendTime);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    this.fare = 0;
    if(this.form?.value?.start_date)
      {
      if(this.form?.value?.start_date?.toString() == this.form?.value?.end_date?.toString()){
        return this.form.patchValue({
          fare: this.fare
        })
      }
        const asd = this.form?.value?.start_date?.toString();
        const tstartDate = new Date(asd);
        tstartDate.setHours(0, 0, 0, 0);
        if(tstartDate < startDate || tstartDate > endDate){
          this.toastr.showError('please select start date in between academic year');
          return false;
        }
        var tendDate = new Date(AYendTime);
        if(this.form?.value?.end_date)
        {
          const aed = this.form?.value?.end_date?.toString();
          tendDate = new Date(aed);
          tendDate.setHours(0, 0, 0, 0);
          if(tendDate < startDate || tendDate > endDate){
            this.toastr.showError('please select end date in between academic year');
            return false;
          }
        }
        if(this.calculation_type == 0){
          const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))+1;
          
          const ttimeDiff = Math.abs(tendDate.getTime() - tstartDate.getTime());
          const tdaysDiff = Math.ceil(ttimeDiff / (1000 * 3600 * 24))+1;
          const percentage = tdaysDiff/daysDiff*100;
          this.fare = Number(this.total_fare * (percentage/100)).toFixed(0);
          this.form.patchValue({
            fare: this.fare
          })
          
        }else if (this.calculation_type == 1){
          let monthArray:any = this.getMonths(AYstartTime, AYendTime, true);

          let transportMonthArray:any = this.getMonths(tstartDate, tendDate, false);

          let amount:any = 0;
          transportMonthArray.forEach((month:any) => {
            if (monthArray.includes(month)) {
              let amt = parseFloat((this.total_fare / monthArray.length).toFixed(2));
              if(tstartDate.getDate() > 15 && tstartDate.toLocaleString('default', { month: 'long' }) == month){
                amt = amt / 2;
              }
              if(tendDate.getDate() <= 15 && tendDate.toLocaleString('default', { month: 'long' }) == month){
                amt = amt / 2;
              }
              amount = amount + amt;
            }
          });
          this.fare = Number(amount).toFixed(0);
          this.form.patchValue({
            fare: this.fare
          })
        }
    }
    return true;
  }

  getMonths(start_date:any, end_date:any, end_date_update:any){
    const start = new Date(start_date);
        const end = new Date(end_date);
        let months:any = [];
  
        if(end_date_update == true){
          end.setDate(1);
        }
  
        while (start <= end) {
            let month = start.toLocaleString('default', { month: 'long' });
            months.push(`${month}`);
  
            start.setMonth(start.getMonth() + 1);
        }
        return months
  }

  get_for(condition:string):any {
    this.type = condition;
    if (condition == "student") {
      //this.form.controls['section'].setValidators([Validators.required]);
      this.form.controls['classes'].setValidators([Validators.required]);
      this.form.controls['batches'].setValidators([Validators.required]);
      this.form.controls['students'].setValidators([Validators.required]);
      this.form.controls['employees'].clearValidators();
    } else {
      this.form.controls['employees'].setValidators([Validators.required]);
     // this.form.controls['section'].clearValidators();
      this.form.controls['classes'].clearValidators();
      this.form.controls['batches'].clearValidators();
      this.form.controls['students'].clearValidators();
    }
    //this.form.controls['section'].updateValueAndValidity();
    this.form.controls['classes'].updateValueAndValidity();
    this.form.controls['batches'].updateValueAndValidity();
    this.form.controls['students'].updateValueAndValidity();
    this.form.controls['employees'].updateValueAndValidity();
  }

  get_transport_mode(event:any){
    this.form.controls['pickup_route'].clearValidators();
    this.form.controls['pickup_stand'].clearValidators();
    this.form.controls['drop_route'].clearValidators();
    this.form.controls['drop_stand'].clearValidators();
    if(event != 'one way drop'){
      this.form.controls['pickup_route'].setValidators([Validators.required]);
      this.form.controls['pickup_stand'].setValidators([Validators.required]);
    }
    if(event != 'one way pickup'){
      this.form.controls['drop_route'].setValidators([Validators.required]);
      this.form.controls['drop_stand'].setValidators([Validators.required]);
    }
    this.form.controls['pickup_route'].updateValueAndValidity();
    this.form.controls['pickup_stand'].updateValueAndValidity();
    this.form.controls['drop_route'].updateValueAndValidity();
    this.form.controls['drop_stand'].updateValueAndValidity();
    // this.get_fare()
  }

  handleDate(){
    this.get_fare();
    if(this.id){
      if(this.form.controls['start_date'].value > this.assign_transport.data.end_date){
        this.form.controls['reason'].patchValue('');
        this.removeAttachment(0)
        this.defaultAttachment.forEach((ele => {
          this.addAttachment(ele);
        }))
      }else{
        this.form.controls['reason'].patchValue(this.assign_transport.data.reason);
        this.removeAttachment(0)
        if(this.attachmentList.length == 0){
          this.defaultAttachment.forEach((ele => {
            this.addAttachment(ele);
          }))
        }else{
          this.addAttachment();
        }
      }
    }
  }

  formInit(){
    this.form = this.fb.group({
      for: ['student'],
      section: [''],
      classes: [null,[Validators.required]],
      batches: [null,[Validators.required]],
      students: [null,[Validators.required]],
      employees: [null],
      transport_mode: [null,[Validators.required]],
      area_id: [],
      pickup_route: [null],
      pickup_stand: [null],
      drop_route: [null],
      drop_stand: [null],
      fare: [null],
      start_date: ['',[Validators.required]],
      end_date: [''],
      reason: [''],
      attachment: this.fb.array([]),
    });
  }

  submit(): void{
    this.is_loading = true
    this.form.markAllAsTouched();
    if (!this.form.valid) {
      this.is_loading = false 
      return 
    }
    this.onStudentEmployeeSelect();
    // if(!this.getCalculatedFair()){
    //   return;
    // }
    let section_id = this.form.value.section;
    Object.assign(this.form.value, {
      id:this.id,
      section_id: section_id,
      total_fare : this.total_fare,
      is_father_message: this.send_father,
      is_mother_message: this.send_mother,
      is_student_message: this.send_student,
      for: this.assign_transport?.data?.for ?? this.type 
    });
    const formData = this.convertToFormData(this.form.value); 
    this.transportService.saveAssignTransport(formData,this.id).subscribe((res:any) => {  
      if(res.status){
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.setUrl(URLConstants.ASSIGN_TRANSPORT)]);
        this.is_loading = false
      }else{
        this.toastr.showError(res.message);
        this.is_loading = false
      }
      this.closeModal();
    },(err:any)=>{
      this.toastr.showError(err.error.message);
      this.is_loading = false
      this.closeModal();
    }); 
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  convertToFormData(data: any, formData: FormData = new FormData(), parentKey: string = ''): FormData {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
      Object.keys(data).forEach(key => {
        this.convertToFormData(
          data[key],
          formData,
          parentKey ? `${parentKey}[${key}]` : key
        );
      });
    } else {
      if (parentKey) {
        formData.append(parentKey, data === null || data == undefined ? '' : data);
      }
    }
    return formData;
  }

  selectAttachment(event,item) {
    const file = event.target.files[0]
    item.controls.attachment.patchValue(file);
  }

  get attachmentArray() {
    return this.form.get('attachment') as FormArray;
  }

  createAttachment(ele?:any): FormGroup {
    return this.fb.group({
      attachment_name: [ele?.attachment_name ?? null],
      attachment: [null],
    });
  }

  addAttachment(ele?:any) {
    this.attachmentArray.push(this.createAttachment(ele))
  }

  removeAttachment(i) {
    this.attachmentArray.removeAt(i);
  }

  deleteAttachment(attachment_id:any, type:any){
    let confirm = window.confirm('Are you sure you want to delete this attachment');
    if(confirm){
      this.transportService.deleteAttachment(attachment_id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          if(type == 'transport'){
            this.attachmentList = resp.data
          }
          if(type == 'history'){
            this.modelAttachments = resp.data
          }
          this.ngOnInit();
        }else{
          this.toastr.showError(resp.message)
        }
      })
    }
  }

  sendMessage(content){
    this.modalService.open(content,{
      size: 'lg',
      centered: true
    }).result.then((result) => {
    },(reason:any) => {
    });
  }

  attachment(content:any, row:any){
    this.modelAttachments = row.transport_attachments
    this.modalService.open(content,{
      size: 'lg',
      centered: true
    }).result.then((result) => {
    },(reason:any) => {
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
