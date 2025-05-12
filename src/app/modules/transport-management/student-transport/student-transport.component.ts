import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Toastr } from '../../../core/services/toastr';
import { TransportService } from '../transport.service';
import { CommonService } from 'src/app/core/services/common.service';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { StudentService } from '../../student/student.service';
import { ActivatedRoute } from '@angular/router';
import { AcademicService } from '../../academics/academics.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-student-transport',
  templateUrl: './student-transport.component.html',
  styleUrls: ['./student-transport.component.scss']
})
export class StudentTransportComponent implements OnInit, OnChanges {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  form:FormGroup = new FormGroup({})
  transport_modes:any = [
    {name:"Two Way Transport",value:"two way transport"},
    {name:"One Way Pickup",value:"one way pickup"},
    {name:"One Way Drop",value:"one way drop"}
  ];
  transport_mode:any = 'two way transport';
  stops:any;
  pickupStand:any;
  dropStand:any;
  pickup_routes:any;
  drop_routes:any;
  fare:any = 0;
  total_fare:any = 0;
  @Input() academicYear:any;
  @Input() student:any;
  @Output() refreshAcademic:any = new EventEmitter<any>();
  warning:any;
  transport:any;
  assign_transport_history:any =[]
  for:any = null;
  calculation_type:any;
  status:any = null;

  attachmentList:any = [];
  modelAttachments:any = [];
  studentId : string | null = null

  send_father = false
  send_mother = false
  send_student = false

  is_loading : boolean = false

  areas:any = []

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
  constructor(
      private fb: FormBuilder, 
      private toastr: Toastr,
      private transportService: TransportService,
      public commonService: CommonService,
      private modalService: NgbModal,
      private _studentService: StudentService,
      private _activatedRoute: ActivatedRoute,
      private _academicService: AcademicService,
      public  dateFormateService : DateFormatService,
  ) {}

  ngOnInit(): void {
    this.formInit();
    this.getAreaList();
    this.studentId = this._activatedRoute.snapshot.paramMap.get('id') || null
    this.transportService.getAcademicYear().subscribe((res:any) => {
      this.academicYear = res.data;
    }); 
    
    this.transportService.systemSetting('fees_calculation_type').subscribe((res: any) => {             
      // value 0 = day wise calculation
      // value 1 = month wise calculation
      this.calculation_type = res
    });
    this.getStops();
    this.getStudentAndAcademic() 
    this.get_transport_mode(this.transport_mode)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] && changes['student'].currentValue) {
      this.getStudentTransportDetail();
    }
  }

  getStudentTransportDetail(){
    this.transportService.getStudentTransportDetail({student_id:this.student?.id}).subscribe((response:any) => {  
      const transport = response.data;
      this.refreshAcademic.emit();
      if(transport){
        const today = new Date().setHours(0, 0, 0, 0);
        if((new Date(transport.start_date).setHours(0, 0, 0, 0)) <= today && (new Date(transport.end_date).setHours(0, 0, 0, 0)) >= today){
          this.status = 'Active';
        }else{
          this.status = 'Inactive';
        }
        this.transport = transport;
        this.for = this.transport.for
        this.assign_transport_history = this.transport.transport_history
        console.log(this.assign_transport_history);
        

        this.getRouteByStop(transport.pickup_stand, null);
        this.getRouteByStop(transport.drop_stand, null);
        
        if(transport?.transport_mode != 'one way drop' && transport?.pickup_route?.status == "inactive"){
          this.warning += 'pickup route';
        }
        if(transport?.transport_mode != 'one way pickup' && transport?.drop_route?.status == "inactive"){
          this.warning += this.warning ? ' and drop route' : 'drop route';
        }
        if(this.warning){
          this.warning += ' is currently inactive or removed please select different if you wish to..';
        }
        this.getStops(transport.area_id)
        this.form.patchValue({
            transport_mode: transport.transport_mode,
            area_id: transport.area_id,
            pickup_stand: transport.pickup_stand?.id,
            pickup_route: transport.pickup_route?.id,
            drop_stand: transport.drop_stand?.id,
            drop_route: transport.drop_route?.id,
            fare: transport.fare,
            start_date: transport.start_date,
            end_date: transport.end_date,
            reason: transport.reason,
        });  
        this.removeAttachment(0);
        this.attachmentList = transport.transport_attachments
        if(this.attachmentList.length == 0){
          
          this.defaultAttachment.forEach((ele => {
            this.addAttachment(ele);
          }))
        }else{
          this.addAttachment();
        }
      }else{
        this.defaultAttachment.forEach((ele => {
          this.addAttachment(ele);
        }))
        this.form?.get('start_date')?.setValue(this.academicYear?.start_time);
        this.form?.get('end_date')?.setValue(this.academicYear?.end_time);
      }
      // this.get_fare();
    });
  }

  initialize(){
    this.dtOptions = {
    serverSide: false,
    searching: false,
    info: false,
    scrollX: true,
     columns: [
        { data: 'id' },
        { data: 'student', orderable: false}, 
        { data: 'employee',orderable: false }, 
        { data: 'transport_mode',orderable: false }, 
        { data: 'pickup_route',orderable: false }, 
        { data: 'pickup_stand',orderable: false }, 
        { data: 'drop_route',orderable: false }, 
        { data: 'drop_stand',orderable: false }, 
        { data: 'start_date',orderable: false }, 
        { data: 'end_date',orderable: false }, 
        { data: 'fare',orderable: false },
        { data: 'transport_status',orderable: false },
        { data: 'reason',orderable: false },
        { data: 'Detail', orderable: false, },
        { data: 'action',orderable: false },
      ],
      order: [[0, 'desc']],
    };
  }

  

  formInit(){
    this.form = this.fb.group({
      for: ['student'],
      classes: [[{}]],
      batches: [],
      students: [],
      transport_mode: ['two way transport',[Validators.required]],
      area_id: [],
      pickup_route: [],
      pickup_stand: [],
      drop_route: [],
      drop_stand: [],
      fare: [],
      start_date: ['',[Validators.required]],
      end_date: [],
      reason: [''],
      attachment: this.fb.array([]),
    });
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
    this.get_fare()
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

  getAreaList(){
    this.transportService.AreaList().subscribe((resp:any) => {
      if(resp.status){
        this.areas = resp.data.transportAreaList;
      }
    })
  }

  getRouteByStop(event:any, type:any, drop = false){
    this.transportService.getRouteByStop({stop_id:event?.id}).subscribe((response:any)=>{
      if(drop){
        this.drop_routes = response.data;
        if(type == 'form'){
          this.form?.get('drop_route')?.setValue(null);
        }
      }else{
        this.pickup_routes = response.data;
        this.drop_routes = response.data;
        if(type == 'form'){
          this.dropStand = this.pickupStand;
          this.form?.get('pickup_route')?.setValue(null);
          this.form?.get('drop_route')?.setValue(null);
        }
      }
      // this.get_fare()
    });
  }

  changePickupRoute(event:any, type:any){
    if(type == 'pickup'){
      if(!this.validateRoute(event?.id,'pickupRoute')){
        alert('pickup route vehicle doesn\'t have enough seats available. please select different route');
        this.form?.get('pickup_route')?.setValue(this.transport.pickup_route?.id ?? null);
      }
    }else{
      if(!this.validateRoute(event?.id,'dropRoute')){
        alert('drop route vehicle doesn\'t have enough seats available. please select different route');
        this.form?.get('pickup_route')?.setValue(this.transport.drop_route?.id ?? null);
      }
    }
    this.form?.get('drop_route')?.setValue(event?.id);
    this.get_fare();
  }

  get_fare(){
    const start_date = this.form.controls['start_date'].value;
    const end_date = this.form.controls['end_date'].value;
    if(start_date && end_date && start_date > end_date){
      return;
    } 
    this.total_fare = 0;
    if(this.transport_mode != 'one way drop' && this.form.value.pickup_stand){
      this.total_fare += this.stops?.find((o:any) => o.id == this.form.value.pickup_stand)?.fare;
    }
    if(this.transport_mode != 'one way pickup' && this.form.value.drop_stand){
      this.total_fare += this.stops?.find((o:any) => o.id == this.form.value.drop_stand)?.fare;
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

  handleDate(){
    this.get_fare();
    if(this.transport){
      if(this.form.controls['start_date'].value > this.transport.end_date){
        this.form.controls['reason'].patchValue('');
        this.removeAttachment(0)
        this.defaultAttachment.forEach((ele => {
          this.addAttachment(ele);
        }))
      }else{
        this.form.controls['reason'].patchValue(this.transport.reason);
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

  submit(): void{
    this.is_loading = true
    // if(!this.getCalculatedFair()){
    //   return;
    // }

    this.form?.get('students')?.setValue([{
      'id': this.student?.id,
      'name': this.student?.full_name
    }]);
    this.form?.get('batches')?.setValue([{
      'id': this.student?.batch_id,
      'name': this.student?.batch
    }]);
    const pickup_route = this.pickup_routes?.find((item:any)=>item.id == this.form?.value?.pickup_route);
    if(pickup_route?.available_pickup_seats < 1){
      this.form?.get('pickup_route')?.setValue(null);
      this.toastr.showError('seat not available in selected pickup route');
      return;
    }
    const drop_route = this.drop_routes?.find((item:any)=>item.id == this.form?.value?.drop_route);
    if(drop_route?.available_drop_seats < 1){
      this.form?.get('drop_route')?.setValue(null);
      this.toastr.showError('seat not available in selected drop route');
      return;
    }

    if(this.total_fare == 0 && this.form.value.fare > 0){
      this.total_fare = this.form.value.fare
    }

    Object.assign(this.form.value, {
      total_fare : this.total_fare,
      is_father_message: this.send_father,
      is_mother_message: this.send_mother,
      is_student_message: this.send_student,
      for: 'student'
    });
    const formData = this.convertToFormData(this.form.value); 
    this.transportService.saveAssignTransport(formData, this.transport?.id ?? null).subscribe((res:any) => {  
      if(res.status){
        this.toastr.showSuccess(res.message);
        this.refreshAcademic.emit();
      }else{
        this.toastr.showError(res.message);
      }
      this.is_loading = false
      this.getStudentTransportDetail();
      this.closeModal();
    },(err:any)=>{
      this.is_loading = false
      this.toastr.showError(err.error.message);
      this.closeModal();
    }); 
  }

  validateRoute(route:number,type:string){
    var data:any = [];
    if(route){
      if(type == 'pickupRoute'){
        data = this.pickup_routes.filter((item:any) =>{ return item.id == route });
        if(data[0].available_pickup_seats <= 0){
          return false
        }
      }else{
        data = this.drop_routes.filter((item:any) =>{ return item.id == route });
        if(data[0].available_drop_seats <= 0){
          return false
        }
      }
    }
    return true;
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
          this.getStudentTransportDetail();
          if(type == 'transport'){
            this.attachmentList = resp.data
          }
          if(type == 'history'){
            this.modelAttachments = resp.data
          }
        }else{
          this.toastr.showError(resp.message)
        }
      })
    }
  }

  openAttachment(content:any, row:any){
    
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

  sendMessage(content){
    this.modalService.open(content,{
      size: 'lg',
      centered: true
    }).result.then((result) => {
    },(reason:any) => {
    });
  }
  
  dateFormat(date:any){
    return moment(date, 'Y-m-d').format('d-m-Y');
  }

  getStudentAndAcademic() {
    const payload = {
      id : this.studentId
    }
    this._studentService.fetchStudentDetails(payload).subscribe((res:any)=>{
      this.student = res
      // Here API response in derectly getting student details insted of message formate so based on ID condition implemented
      if (res?.id) {
        const data = {
          student_id: this.student.id,
          course_id: this.student.course_id
        }
        this._academicService.getStudentFeesDetail(data).subscribe((resp: any) => {
          this.academicYear = resp.data.academicYear
          this.getStudentTransportDetail()
        })
      } else {
        this.toastr.showError('Student not found');
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
}
