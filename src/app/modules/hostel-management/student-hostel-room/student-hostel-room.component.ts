import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import { Toastr } from 'src/app/core/services/toastr';
import { HostelManagementService } from '../hostel-management.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StudentService } from '../../student/student.service';
import { ActivatedRoute } from '@angular/router';
import { AcademicService } from '../../academics/academics.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-student-hostel-room',
  templateUrl: './student-hostel-room.component.html',
  styleUrls: ['./student-hostel-room.component.scss']
})
export class StudentHostelRoomComponent implements OnInit, OnChanges {
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  hostels:any;
  hostel:any;
  roomTypes:any;
  roomType:any;
  rooms:any;
  room:any;
  studentHostel:any;
  @Input() student:any;
  @Input() academicYear:any;
  @Output() refreshAcademic:any = new EventEmitter<any>();
  submitted:boolean = false;
  disableSave:boolean = false;
  studentId : string | null = null

  constructor(
    private hostelService: HostelManagementService,
    private fb: FormBuilder, 
    private toastr: Toastr,
    private modalService: NgbModal,
    private _studentService: StudentService,
    private _activatedRoute: ActivatedRoute,
    private _academicService: AcademicService,
    public  dateFormateService : DateFormatService,
  ) { }

  form:any = this.fb.group({
    student_id: [],
    hostel_id: [null,[Validators.required]],
    room_type_id: [null,[Validators.required]],
    room_id: [null,[Validators.required]],
    allotment_date: [null,[Validators.required]],
    left_date: [null],
    applicable_fees: ['new',[Validators.required]],
    reason: [null],
    attachments: this.fb.array([]),
    amount: [0, [Validators.required]]
  });

  total_amount:any = null

  defaultAttachment = [
    {attachment_name: 'Hostel Cancellation Form', attachment: null},
  ];

  studentHostelList:any = [];

  modelAttachments:any = [];
  modalReason:any;
  fileIcons:any = {
    "pdf" : './assets/img/files/file.png',
    "png" : './assets/img/files/image.png',
    "jpg" : './assets/img/files/image.png',
    "jpeg" : './assets/img/files/image.png',
    "gif" : './assets/img/files/image.png',
    "webp" : './assets/img/files/image.png',
  };

  feesDetail:any = null;
  updateForm:any = {
    id: null,
    allotment_date: null,
    left_date: null,
    name: null,
    applicable_fees: null,
    room_id: null,
    reason: null,
    attachments: [{
      attachment_name: null,
      attachment: null
    }],
    amount: null
  }

  ngOnInit(): void {
    this.studentId = this._activatedRoute.snapshot.paramMap.get('id') || null
    this.hostelService.getAcademicYear().subscribe((res:any) => {
      this.academicYear = res.data;
    }); 
    this.getHostelList();
    this.roomTypeList();
    this.initialize();
    this.getStudentAndAcademic()
  }

  initialize(){
    this.dtOptions = {
      serverSide: false,
      searching: false,
      info: false,
      // scrollX: true,
      columns: [
        {data: 'student', orderable: false},
        {data: 'class', searchable: false, orderable: false},
        {data: 'batch', searchable: false, orderable: false},
        {data: 'hostel', searchable: false, orderable: false},
        {data: 'room_number', searchable: false, orderable: false},
        {data: 'total_fees', searchable: false, orderable: false},
        {data: 'paid_amount', searchable: false, orderable: false},
        {data: 'discount_amount', searchable: false, orderable: false},
        {data: 'remaining_fees', searchable: false, orderable: false},
        {data: 'applicable_fees', searchable: false, orderable: false},
        {data: 'allotment_date', searchable: false, orderable: false},
        {data: 'left_date', searchable: false, orderable: false},
        {data: 'detail', searchable: false, orderable: false},
        {data: 'action', orderable: false, searchable: false},
      ],
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] && changes['student'].currentValue) {
      this.initialize();
      // this.getStudentHostelDetail();
      this.getStudentHostelList();
      this.defaultAttachment.forEach((ele => {
        this.addAttachment(ele);
      }))
    }
  }

  getStudentHostelDetail(){
    this.hostelService.getStudentHostelDetail({student_id:this.student?.id}).subscribe((response:any) => {
      this.studentHostel = response.data;
      if(this.studentHostel)
      {
        this.form.setValue({
          student_id: null,
          hostel_id : this.studentHostel?.hostel_id,
          room_type_id : this.studentHostel?.room?.room_type_id,
          room_id : this.studentHostel?.room_id,
          allotment_date : this.studentHostel?.allotment_date,
          left_date : this.studentHostel?.left_date,
          applicable_fees : this.studentHostel?.applicable_fees??'new',
        });
        this.getRooms();
      }else{
        this.form.get('allotment_date').setValue(this.academicYear?.start_time);
        this.form.get('left_date').setValue(this.academicYear?.end_time);
      }
    });
  }

  getStudentHostelList(){
    this.hostelService.getStudentHostelList({student_id:this.student?.id}).subscribe((resp:any) => {
      if(resp.status){
        this.studentHostelList = resp.data;
        this.refreshAcademic.emit();
      }
    })
  }

  getHostelList(){
    this.hostelService.getHostelDropdownList().subscribe((response:any) => {
      this.hostels = response.data;
    });
  }

  roomTypeList(){
    this.hostelService.roomTypeList().subscribe((response:any) => {
      this.roomTypes = response.data;
    })
  }

  getRooms(){
    if(this.roomType){
      this.total_amount = 0;
      let room = this.roomTypes.find((el:any) => el.id == this.roomType)
      
      room.room_wise_fees.forEach((el:any) => {
        if(this.form.value.applicable_fees == 'new'){
          this.total_amount += el.new_month_wise_fees
        }else{
          this.total_amount += el.old_month_wise_fees
        }
      });
      this.getCalculatedFair()
    }
    // console.log(this.roomType);
    
    this.hostelService.roomList({
      hostel_id:this.hostel,
      room_type_id:this.roomType,
    })
    .subscribe((response:any) => {
      this.rooms = response.data;
    })
  }

  handleFeesTypeChange(){
    if(this.roomType){
      this.total_amount = 0;
      let room = this.roomTypes.find((el:any) => el.id == this.roomType)
      
      room.room_wise_fees.forEach((el:any) => {
        if(this.form.value.applicable_fees == 'new'){
          this.total_amount += el.new_month_wise_fees
        }else{
          this.total_amount += el.old_month_wise_fees
        }
      });
      this.getCalculatedFair()
    }
  }

  selectRoom(event:any){
    // if(event?.available_beds < 1){
    //   this.room = null;
    //   this.toastr.showError('Bed not available in selected room');
    // }
  }

  submit(){
    this.submitted = true;
    if(this.form.invalid){
      return;
    }
    // const room = this.rooms.find(item => item.id == this.room);
    // if(!this.room || room?.available_beds < 1){
    //   this.room = null;
    //   this.toastr.showError('Bed not available in selected room');
    //   return;
    // }
    this.form?.get('student_id')?.setValue([{
      'id': this.student?.id,
      'name': this.student?.full_name
    }]);
    this.disableSave = true;
    let formData = this.convertToFormData(this.form.value);
    this.hostelService.assignStudentRoom(formData).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess('Hostel Room assigned successfully')
        this.getStudentHostelList()
        this.refreshAcademic.emit();
        this.studentHostel = {};
        this.submitted = false;
        this.resetForm()
        this.form.get('applicable_fees').setValue('new');
        this.disableSave = false;
      }else{
        this.toastr.showError(resp.data??resp.message)
        this.disableSave = false;
      }
      
    },(err:any)=>{
      this.disableSave = false;
      this.toastr.showError(err?.error?.message);
    });
  }

  calculateRemainingFees(item:any){
    return (parseFloat(item.total_fees) - (parseFloat(item.paid_amount ?? 0)  + parseFloat(item.discount_amount ?? 0)));
  }

  update(){
    let formData = this.convertToFormData(this.updateForm);
    this.hostelService.updateAssignStudentFees(formData).subscribe((resp:any) => {
      if(resp.status){
        this.toastr.showSuccess(resp.message);
        this.modalService.dismissAll();
        this.updateForm.attachments = [{
          attachment_name: null,
          attachment: null
        }]
        this.getStudentHostelList();
      }else{
        this.toastr.showError(resp.message);
      }
    })
  }

  open(content:any, data:any) {
    this.feesDetail = data;
    this.updateForm.id = data.id
    this.updateForm.allotment_date = data.allotment_date
    this.updateForm.left_date = data.left_date
    this.updateForm.name = data.student.full_name
    this.updateForm.applicable_fees = data.applicable_fees
    this.updateForm.room_id = data.room_id
    this.updateForm.student_id = data.student_id
    this.updateForm.reason = data.reason
    this.updateForm.amount = data.total_fees
    if(data?.room?.room_type_id){
      this.total_amount = 0;
      let room = this.roomTypes.find((el:any) => el.id == data?.room?.room_type_id)
      room.room_wise_fees.forEach((el:any) => {
        if(data.applicable_fees == 'new'){
          this.total_amount += el.new_month_wise_fees
        }else{
          this.total_amount += el.old_month_wise_fees
        }
      });
      this.getCalculatedFair('update')
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg',
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
     }).result.then((result) => {
      if(result == 'cancel'){
        this.clearModalForm();
        this.getStudentHostelList();
      }

    })
  }

  delete(item:any){
    let confirm = window.confirm('Are you sure you want to delete this record?')
    if(confirm){
      this.hostelService.deleteAssignStudent(item.id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.getStudentHostelList();
        }else{
          this.toastr.showError(resp.message)
        }

      })
    }
  }

  clearModalForm(){
    this.form.hostel_fee_id = null;
    this.form.payment_date  = new Date().toISOString().substring(0,10);
    this.form.receipt_no  = null;
    this.form.monthly_fees  = [];
    this.form.discount_monthly_fees = [];
    this.form.payment_mode  = 0;
    this.form.cheque_no = null;
    this.form.cheque_date = null;
    this.form.bank_name = null;
    this.form.account_number = null;
    this.form.account_holder_name = null;
    this.form.upi_id = null;
    this.form.transaction_id = null;
  }

  dateFormat(dateStr:any){
    const date = new Date(dateStr);

    // Extract the day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();

    // Format the date as DD-MM-YYYY
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
  }

  resetForm() {
    this.form.reset();
  }

  selectAttachment(event,item, type?:any) {
    const file = event.target.files[0]
    if(type == 'edit'){
      item.attachment = file;
    }else{
      item.controls.attachment.patchValue(file);
    }
  }

  get attachmentArray() {
    return this.form.get('attachments') as FormArray;
  }

  createAttachment(ele?:any): FormGroup {
    return this.fb.group({
      attachment_name: [ele?.attachment_name ?? null],
      attachment: [null],
    });
  }

  addAttachment(ele?:any, type?:any) {
    if(type == 'edit'){
      this.updateForm.attachments.push({
        attachment_name: null,
        attachment: null
      })
    }else{
      this.attachmentArray.push(this.createAttachment(ele))
    }
  }

  removeAttachment(i, type?:any) {
    if(type == 'edit'){
      this.updateForm.attachments.splice(i, 1);
    }else{
      this.attachmentArray.removeAt(i);
    }
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


  attachment(content:any, row:any, type:any){
    this.modelAttachments = [];
    this.modalReason = null;
    if(type == 'attachment'){
      this.modelAttachments = row.hostel_attachments
    }
    if(type == 'reason'){
      this.modalReason = row.reason;
    }
    
    this.modalService.open(content,{
      size: 'lg',
      centered: true
    }).result.then((result) => {
    },(reason:any) => {
    });
  }

  deleteAttachment(attachment_id:any){
    let confirm = window.confirm('Are you sure you want to delete this attachment');
    if(confirm){
      this.hostelService.deleteAttachment(attachment_id).subscribe((resp:any) => {
        if(resp.status){
          this.toastr.showSuccess(resp.message)
          this.modelAttachments = resp.data
          this.getStudentHostelList();
        }else{
          this.toastr.showError(resp.message)
        }
      })
    }
  }
  
  getStudentAndAcademic() {
    const payload = {
      id: this.studentId
    }
    this._studentService.fetchStudentDetails(payload).subscribe((res) => {
      this.student = res
      const data = {
        student_id: this.student.id,
        course_id: this.student.course_id
      }

      this._academicService.getStudentFeesDetail(data).subscribe((resp: any) => {
        this.academicYear = resp.data.academicYear
        this.initialize();
        // this.getStudentHostelDetail();
        this.getStudentHostelList();
        this.defaultAttachment.forEach((ele => {
          this.addAttachment(ele);
        }))
      })
    })
  }


  getCalculatedFair(type?:any,event?,name?){
    if(event && type == 'update'){
      this.updateForm[name] = event.target.value
    }
    
    const AYstartTime = this.academicYear.start_time;
    const AYendTime = this.academicYear.end_time;
    const startDate = new Date(AYstartTime);
    const endDate = new Date(AYendTime);

    let allotment_date;
    let left_date;
    if(this.form.value.allotment_date || type == 'update'){
      if(type == 'update'){
        allotment_date = new Date(this.updateForm.allotment_date);
        left_date = this.updateForm.left_date ? new Date(this.updateForm.left_date) : new Date(AYendTime);
      }else{
        allotment_date = new Date(this.form.value.allotment_date);
        left_date = this.form.value.left_date ? new Date(this.form.value.left_date) : new Date(AYendTime);
      }
      
      
      this.form.get('amount').setValue(0);
      this.updateForm.amount = 0;
      let amount:any = 0;
      if(allotment_date.toLocaleDateString() != left_date.toLocaleDateString()){
          let monthArray:any = this.getMonths(AYstartTime, AYendTime, true);
          let transportMonthArray:any = this.getMonths(allotment_date, left_date, false);
          
          transportMonthArray.forEach((month:any) => {
            if (monthArray.includes(month)) {
              let amt = parseFloat((this.total_amount / monthArray.length).toFixed(2));
              if(allotment_date.getDate() > 15 && allotment_date.toLocaleString('default', { month: 'long' }) == month){
                amt = amt / 2;
              }
              if(left_date.getDate() <= 15 && left_date.toLocaleString('default', { month: 'long' }) == month){
                amt = amt / 2;
              }
              amount = amount + amt;
            }
          });
        }
        if(type == 'update'){
          this.updateForm.amount = Number(amount).toFixed(0);
        }else{
        this.form.get('amount').setValue(Number(amount).toFixed(0));
        }
      }
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
  
}
