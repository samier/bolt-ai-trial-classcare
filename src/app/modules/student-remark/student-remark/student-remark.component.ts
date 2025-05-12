import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Toastr } from 'src/app/core/services/toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentRemarkService } from '../student-remark.service';
import { LeaveManagmentService } from '../../leave-management/leave-managment.service';
import { remarkType } from 'src/app/common-config/static-value';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import moment from 'moment';

@Component({
  selector: 'app-student-remark',
  templateUrl: './student-remark.component.html',
  styleUrls: ['./student-remark.component.scss']
})
export class StudentRemarkComponent implements OnInit { 

  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  URLConstants = URLConstants;
  students:any = [];
  searchText:any;
  pageSize = 50; 
  currentPage = 0;
  student:any = [];
  selectedStudent: any = [];
  remarkType: any = remarkType;
  remarkTitle: any = null;
  title: any;
  custom: boolean = false;
  isSave: boolean = false;
  studentId: any;
  remarkTypeFor = 1;
  remarkForm: FormGroup | any;
  dropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    itemsShowLimit: 3,
  };
  remarkId: string | null = null

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,    
    private toastr : Toastr,    
    public studentRemarkService : StudentRemarkService,
    public leaveManagmentService : LeaveManagmentService,
    private cdr: ChangeDetectorRef,
    private formValidationService: FormValidationService,
    private router: Router,
    public activatedRouteService: ActivatedRoute,
  ) { }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getAllStudent();
    this.remarkId = this.activatedRouteService.snapshot.paramMap.get('id') || null
    if (this.remarkId) {
      this.getRemarkData(this.remarkId);
    }
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  dateChange(event:any)
  {

  }
  
  changeFn(val:any){
    this.searchText = '';
    this.cdr.detectChanges();
    // this.searchFilter();    
  }

  resetScroll(){
    this.pageSize = 50; 
    this.currentPage = 0;
    this.students = [];
  }
  
  loadItems() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    var newItems;
    if(this.searchText){
      newItems = this.student.filter((item:any)=>item?.name?.toLowerCase().includes(this.searchText?.toLowerCase()) );
      newItems = newItems?.slice(startIndex, endIndex);
    }else{
      newItems = this.student.slice(startIndex, endIndex);
    }      
    this.students = [...this.students, ...newItems];
    this.currentPage++;
  }

  onScroll(event:any) {
    var Faculty_length = 0;
    if(this.searchText){
      Faculty_length = this.student.filter((item:any)=>item?.name?.toLowerCase().includes(this.searchText?.toLowerCase()) ).length; 
    }else{
      Faculty_length = this.student?.length;
    }
    if(Faculty_length > 0 && this.students?.length > 0 && this.students?.length < Faculty_length && event.end == this.students?.length){
      this.loadItems();
    }
  }

  searchFilter(){
    this.resetScroll();
    this.loadItems();
  }

  getAllStudent(){
    this.resetScroll();  
    this.searchText = '';
    this.leaveManagmentService.getAllStudent().subscribe((res:any) => {
     //this.student=res.data;   
     this.students=res.data; 
     this.loadItems();
     if(res.data != undefined){
      // this.selectedStudent = res.data[0]?.id;
     }
    }); 
  }

  changeRemarkType(item:any, remark_title:any)
  {
    this.remarkTitle = null;
    let remarkType = item.id ? item.id : item;
    this.studentRemarkService.getRemarkTitle({remark_type:remarkType}).subscribe((res:any) => {
      this.title = res?.data;
      this.remarkTitle = this.title.map((ele) => {
        return { id: ele?.id, name: ele?.remark }
      })
      this.remarkForm.controls['remarkTitle'].patchValue(remark_title);
    });
  }

  onSubmit()
  {
    if(this.remarkId)
    {
      this.remarkForm.controls['student'].clearValidators();      
    }else
    {
      this.remarkForm.controls['student'].setValidators([Validators.required]);
    }
      this.remarkForm.controls['student'].updateValueAndValidity();

    if (this.remarkForm.invalid) {      
      this.formValidationService.getFormTouchedAndValidation(this.remarkForm)
      this.toastr.showError("Please fill all the required field")
      return;
    }
    this.isSave = true;
    let ids = [];
    let selectedRemark = null;
    if(this.remarkForm.value.student)
    {
      this.studentId = this.remarkForm.value.student;
      ids = this.studentId.map((item:any) => item.id);
    }
    if(this.remarkForm.value.remarkType == 2)
    {
      let selectedId = this.remarkForm.value.remarkTitle;
      selectedRemark = this.remarkTitle.find((ele) => ele.id == selectedId)?.name;
    }
    const payload = {
      "student_id":ids,
      "created_at":this.remarkForm.value.date,
      "updated_at":this.remarkForm.value.date,
      "remark_type":this.remarkForm.value.remarkType,
      "remark_id":this.remarkForm.value.remarkTitle,
      "remark_type_for":this.remarkTypeFor,
      "remark":selectedRemark,
    }
    
    this.studentRemarkService.sendRemark(payload,this.remarkId).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.toastr.showSuccess(res.message);
        this.router.navigate([this.CommonService.setUrl(URLConstants.STUDENT_REMARKS_LIST)]);
      }
    },(err:any)=>{
      this.isSave = false;
      this.toastr.showError(err.error.message);
    });
  }

  getRemarkData(id) 
  {
    this.studentRemarkService.getRemarkData(id).subscribe((res: any) => {
      if (res.status) {
        const utcDate = res?.data[0].remarks[0].updated_at;
        const localDate = moment.utc(utcDate).local().format('YYYY-MM-DD');        
        this.remarkForm.controls['date'].patchValue(localDate);
        this.remarkForm.controls['remarkType'].patchValue(res.data[0].remarks[0].remark_type);
        this.changeRemarkType(res.data[0].remarks[0].remark_type,res.data[0].remarks[0].remark_id)        
      }
    })
  }

  getDate(data:any, mode = 0) {
      const formattedDate = moment().format('YYYY-MM-DD');      
      return formattedDate
    }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.remarkForm = this._fb.group({
      date: [this.getDate(null),[Validators.required]],
      student: [[]],
      remarkType: [null,[Validators.required]],
      remarkTitle: [null,[Validators.required]],
    });    
  }

   // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------

}
