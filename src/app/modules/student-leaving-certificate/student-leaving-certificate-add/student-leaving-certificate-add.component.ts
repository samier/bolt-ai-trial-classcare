import { Component, Pipe } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray, AbstractControl  } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../core/services/toastr';
import { DatePipe } from '@angular/common';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { StudentLeavingCertificateService } from '../student-leaving-certificate.service';
import { CommonService } from 'src/app/core/services/common.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-student-leaving-certificate-add',
  templateUrl: './student-leaving-certificate-add.component.html',
  styleUrls: ['./student-leaving-certificate-add.component.scss']
})
export class StudentLeavingCertificateAddComponent {

  constructor(
      private fb: FormBuilder,
      private activatedRouteService: ActivatedRoute,
      private router: Router,
      private toastr: Toastr,
      private datePipe: DatePipe,
      private leavingCertificateService: StudentLeavingCertificateService,
      public CommonService: CommonService,
      private modalService: NgbModal,
  ) {}

  URLConstants = URLConstants;
  saveBtn: string = 'Confirm To Leaving';
  page: string = 'Add';
  id: any = null;
  classes: any = [];
  batches: any = [];
  students: any = [];
  student: any = null;
  branch_id: any = "";
  // selectedClass: any = null;
  // selectedBatch: any = null;
  // selectedStudent: any = null;

  formSubmitValid = true;
  studentCategory: any = null;
  studentDob: any = null;
  studentDoA: any = null;
  invalidLeaveDate: any = false;
  sections = [{ id: '', name: 'All Section' }];
  selectedSection: any = null;
  sectionDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'full_name_gr_number',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  discard_modal_data:any;
  closeResult:any="";
  lc_type : number = 1
  form : FormGroup = new FormGroup({})
  isStudentGet: boolean = false
  studentList:any = []
  studentLcForm:FormGroup = new FormGroup({})
  generateStudentLcIDS:any = []
  selectAllStudent : boolean = false
  isBulkCreated : boolean = false
  student_id : any = ''
  errors:any = [];
  isSubmitStudent : boolean = false
  isSubmitLC : boolean = false

  defaultAttachment = [
    {attachment_name: 'In Active Form', attachment: null},
    {attachment_name: 'N.O.C & In Active Form', attachment: null},
  ];

  ngOnInit(): void {
    this.student_id =  this.activatedRouteService.snapshot.params['student_id'];
    if(this.student_id){
      this.form.value.student = [{id: this.student_id}]
      this.submit();
    }
    
    this.formInit();

    this.leavingCertificateService.getSectionListByBranch().subscribe((res:any) => {
      this.sections = this.sections.concat(res.data);
    });

    this.leavingCertificateService.getClassList().subscribe((res: any) => {
      this.classes = res.data;
  });

  }

  get attechmentArray() {
    return this.studentLcForm.get('attachment') as FormArray;
  }

  changeSection(){
    // this.selectedClass = null;
    this.student = null;
    // this.selectedBatch = null;
    // this.selectedStudent = null;

    const sectionId = this.form.value.section
    this.form.controls['class'].reset();
    this.form.controls['batch'].reset();
    this.form.controls['student'].reset();
    if (sectionId) {
      const data = {
        'section_id': [sectionId]
      }
      this.leavingCertificateService.getClassesList(data).subscribe((res:any) => {
        this.classes = res.data;
      });
    } else {
      this.leavingCertificateService.getClassList().subscribe((res: any) => {
      this.classes = res.data;
    });
    }
  }

  open2(content:any,id) {
    this.studentLcForm.reset();
    this.attechmentArray.controls = []
    // this.selectedStudent = null;
    this.student = null
    this.defaultAttachment.forEach((ele => {
      this.addAttechment(ele);
    }))
    // this.studentLcForm.controls['lc_type'].patchValue(this.lc_type);
    this.studentLcForm.controls['status'].patchValue(false);
    this.studentLcForm.controls['lc_status'].patchValue(1);
    
    this.modalService.open(content, {centered: true,size:'lg',windowClass : "myCustomModalClass",ariaLabelledBy: 'modal-basic-title',backdropClass: 'duplicate-modal-backdrop'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

    if (id) {
      this.generateStudentLcIDS = [id]
      this.changeStudent(id);
    } else {
      let student_ids = this.studentList.filter((el:any) => el.isSelect == true);
    student_ids = student_ids.map((item:any) => item.id);
      this.generateStudentLcIDS = student_ids
    }

  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  changeClass(){
    // this.selectedBatch = null;
    // this.selectedStudent = null;
    this.form.controls['batch'].reset();
    this.form.controls['student'].reset();
    this.student = null;
    const classId = this.form.value.class
    this.leavingCertificateService.getBatchesListByClassId(classId).subscribe((res:any) => {
      this.batches = res.data;
    });
  }
  changeBatch(){
    // this.selectedStudent = null;
    this.form.controls['student'].reset();
    this.student = null;
    const batchId = this.form.value.batch
    this.leavingCertificateService.getStudentListByClassId(batchId).subscribe((res:any) => {
      this.students = res.data;
    });
  }

  changeStudent(student_id:any){
    this.leavingCertificateService.getStudentDetailsByStudentId(student_id).subscribe((res:any) => {
      this.student = res.data;
      if(this.student) {
        this.studentCategory = this.leavingCertificateService.getCategoryName(this.student?.categories);
        this.studentDob = this.student?.date_of_birth ? this.leavingCertificateService.getDateFormat(this.student?.date_of_birth) : 'N/A';
        this.studentDoA = this.student?.admission_date ? this.leavingCertificateService.getDateFormat(this.student?.admission_date) : 'N/A';
      }
    });
  }

  submit(): void{

    this.isSubmitStudent = true

    if(this.form.invalid) {
      return
    }

    const payload = {
      students_id : this.form.value.student.map((ele)=> ele.id)
    }

    this.isStudentGet = true
    this.getStudentDetails(payload, false) 
  }

  getStudentDetails(payload:any, status?:any){
    this.leavingCertificateService.getStudentDetails(payload).subscribe((res:any)=>{
      this.studentList = res
      this.studentList.forEach(element => {
        element.isSelect = false
      });
      this.isStudentGet = false
      this.isSubmitStudent = false

      if(status){
        this.selectAllStudent = false
        this.isBulkCreated = false
        let array:any = []
        this.studentList.forEach((el:any, i:any) => {
          array.push({
            id: el.id,
            full_name_gr_number: el.full_name_gr_number
          })
        })
        this.form.controls['student'].patchValue(array);
      }
      
    })
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  clearForm() {
    this.form.reset();
    this.isSubmitStudent = false
    this.form.controls['section'].patchValue('');
  }

  singleSelect() {
    const selectedBool = this.studentList.map((ele) => ele.isSelect)
    this.isBulkCreated =  selectedBool.filter((ele => ele == true))?.length > 1 ? true : false
    if (selectedBool.includes(false)) {
        this.selectAllStudent = false
    } else {
      this.selectAllStudent = true
    }
  }

  formInit() {
    this.form = this.fb.group({
      class: [null,[Validators.required]],
      batch: [null,[Validators.required]],
      student: [null,[Validators.required]],
      section: [''],
    });

    this.studentLcForm = this.fb.group({
      leaving_date: [null, [Validators.required]],
      progress: [null],
      lc_remark : "",
      conduct: [null],
      working_days_school: [null],
      reason_leaving_school: [null],
      result_last_examination: [null],
      lc_book_no: [null],
      status:[false],
      lc_status:[1],
      // lc_type:[this.lc_type],
      attachment: this.fb.array([]),
    })
  }

  createAttachment(ele?:any): FormGroup {
    return this.fb.group({
      attachment_name: [ele?.attachment_name ?? null],
      attachment: [null],
    });
  }

  addAttechment(ele?:any) {
    this.attechmentArray.push(this.createAttachment(ele))
  }

  removeAttechment(i) {
    this.attechmentArray.removeAt(i);
  }

  handleLcTypeChange(lc_type:any){
    this.lc_type = lc_type;
  }

  createLc() {
    this.isSubmitLC = true
    if (this.studentLcForm.invalid) {
      return
    }

    let payload:any = {
      students : []
    }

    const data:any = this.studentLcForm.value
    
    if (this.generateStudentLcIDS.length > 0) {
      let result  = this.generateStudentLcIDS.map((element:any, i:any) => {
        return {id: element, lc_type: this.lc_type, ...data}
      });
      payload.students = result
    }

    const formData = this.convertToFormData(payload);

      this.leavingCertificateService.addStudentToLeavingCertificate(formData).subscribe((res:any) => {
        this.isSubmitLC = false
        if(res.status == 'warn'){
          this.isStudentGet = true
          this.modalService.dismissAll();
          this.toastr.showError(res.message);
          this.changeBatch();
          let student_ids = this.studentList.filter((el:any) => el.isSelect == false);
          student_ids = student_ids.map((item:any) => item.id);
          student_ids = [...student_ids, ...res.data]
          const payload = {
            students_id : student_ids
          }
          this.getStudentDetails(payload, true)
          
        } else if(res.status == false) {
          this.toastr.showError(res.message);
          this.errors = res.data
        } else {
          this.toastr.showSuccess(res.message);
          this.modalService.dismissAll();
          this.router.navigate([this.setUrl(URLConstants.LEAVING_CERTIFICATE_LIST)]);
        }
      },(err:any)=>{
        this.toastr.showError(err.error.message);
        this.isSubmitLC = false
      });

  }

  selectAttechment(event,item) {
    const file = event.target.files[0]
    item.controls.attachment.patchValue(file);
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
        formData.append(parentKey, data);
      }
    }
    return formData;
  }

  selectAll() {
    if(this.selectAllStudent) {
      this.studentList.map(ele => ele.isSelect = true)
      this.isBulkCreated =  this.studentList?.length > 1 ? true : false
    } else {
      this.studentList.map(ele => ele.isSelect = false)
      this.isBulkCreated = false
    }
  }

}

