import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Toastr } from 'src/app/core/services/toastr';
import { BatchService } from '../batch.service';
import { CommonService } from 'src/app/core/services/common.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
@Component({
  selector: 'app-manage-student-roll-no',
  templateUrl: './manage-student-roll-no.component.html',
  styleUrls: ['./manage-student-roll-no.component.scss']
})
export class ManageStudentRollNoComponent implements OnInit {

   //#region Public | Private Variables

   $destroy: Subject<void> = new Subject<void>();
   rollNoForm: FormGroup = new FormGroup({});
   sectionList: any = []
   classList: any = []
   batchList: any = []
   dtOptions: DataTables.Settings = {};
   @ViewChild(DataTableDirective, { static: false })
   datatableElement: DataTableDirective | null = null;
   tbody:any = []
   isDataLoadOnFilter:boolean = false
   isLoadData:boolean = false
   isRollNoUpdating:boolean = false
   isSaveRollNo:boolean = false
   indexStart : number = 1
   isSubmit: boolean = false
   isSorted: boolean = false
   isValidNumber = true;
   item = { rollno: null };
   user_id : any = window.localStorage.getItem('user_id');

   filterCount:number = 0
   filter : boolean = true
   //#endregion Public | Private Variables
   // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private batchService:BatchService,
    public _fb: FormBuilder,
    private toastr: Toastr, 
    private validationService: FormValidationService   
  ) { }

  //#endregion constructor

   // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
    // this.getClassList();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getClasses() {
    this.rollNoForm.controls['class'].reset();
    this.rollNoForm.controls['batch'].reset();
    this.classList = []
    this.batchList = []
    const section = this.rollNoForm.value ? this.rollNoForm.value.section : ''
    let payload:any = {            
      section_id : section,
      user_id : this.user_id ,
    }
    if (payload.section_id == '') {
      payload = ''
    }
    this.batchService.getClasses(payload).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res?.data;
      }
    })
  }

  getBatches() {
    this.batchList = []
    this.rollNoForm.controls['batch'].reset();
    let payload = 0

    if(!this.rollNoForm.value.class){
      payload =  this.classList.map(ele => ele.id)
    } else {
      payload = this.rollNoForm.value.class
    }
    this.batchService.getBatchesByClass(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.batchList = res?.data;
      }
    })
  }

  showData()
  {
    this.validationService.getFormTouchedAndValidation(this.rollNoForm) 
    if (this.rollNoForm.invalid) {
      this.isSubmit = true;
      return
    }
    this.isLoadData = true
    this.isDataLoadOnFilter = true
    this.initRollNoTable();
    this.reloadData();
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  clearData() {
    this.rollNoForm.reset();
    this.rollNoForm.controls['setting_value'].patchValue(1)
    this.isLoadData = false
    this.getClassList();
    this.filterNumber()
  }

  initRollNoTable()
  {    
    this.dtOptions = {
      paging: false,
      lengthChange: false,
      serverSide: true,
      processing: true,
      searching: false,
      ordering: true,
      scrollX: true,
      scrollCollapse: true,
      info: false,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters, callback);
      },
      columns: [
        { 
          title: "Image",
          data: 'image',
          orderable: false
        },
        { 
          title: "First Name",
          data: 'first_name',
          orderable: true
        },
        { 
          title: "Middle Name",
          data: 'middle_name',
          orderable: true
        },
        { 
          title: "Last Name",
          data: 'last_name',
          orderable: true
        },
        { 
          title: "Roll No",
          data: 'rollno',
          orderable: false
        },
      ],
      // language: {
      //   info: '',
      //   zeroRecords: 'No records found!'
      // }
    };  
  }

  loadData(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.rollNoForm.value
    };
    this.filterNumber()
    this.batchService.getList(
      dataTablesParameters
    ).subscribe((resp: any) => {
      this.isDataLoadOnFilter = false
      this.tbody = resp.data 
      this.tbody.forEach(element => {
        if(element.profile_url){
          element.profile_url = element.profile_url.replace(/&amp;/g, '&');
        }
        element.isValid = true
        if(element.student_roll_number.rollno){
          element.isValid = false
        }
        element.isTouched = false
      });
      callback({
        // recordsTotal: resp.totalRecords,
        // recordsFiltered: resp.totalRecords,
        // data: resp?.data
      });    
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
    } ,(error) => {
      this.isDataLoadOnFilter = false
    });
  }

  filterNumber(){
    this.filterCount = 0;
    Object.keys(this.rollNoForm.value).forEach((item:any)=>{
      if(item != 'setting_value'){
        if((this.rollNoForm.value[item] != '' && this.rollNoForm.value[item] != null)){
          this.filterCount++;
        }
      }
    })
  }
  
  updateRollNumbers()
  {
    if(this.tbody.length == 0)
    {
      this.toastr.showError('No Records In Batch');
    }else
    {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        const order = dtInstance.order();        
        let orderColumn
        if(order?.[0]?.[0] == 1)
        {
          orderColumn = 'student.first_name';        
        }
        if(order?.[0]?.[0] == 2)
        {
          orderColumn = 'student.middle_name';
        }
        if(order?.[0]?.[0] == 3)
        {
          orderColumn = 'student.last_name';
        }
        
        const orderDirection = order?.[0]?.[1] ?? 'asc';
    
        if (!orderColumn || !orderDirection) {
          this.toastr.showError('Please sort the table first.');
          return;
        }
    
        this.isRollNoUpdating = true;
        this.batchService.updateRollNumbers({
          ...this.rollNoForm.value,
          orderColumn,
          orderDirection
        }).subscribe((resp: any) => {
          if (resp.status) {
            this.reloadData();
            this.toastr.showSuccess(resp.message);
          } else {
            this.toastr.showError('Failed to update roll numbers');
          }
          this.isRollNoUpdating = false;
        }, () => {
          this.isRollNoUpdating = false;
        });
      });  
    }
  }

  saveRollNo()
  { 
    this.isSaveRollNo  = true;
    if(this.tbody.length == 0)
    {
      this.toastr.showError('No Records In Batch');
      this.isSaveRollNo  = false;
    }else
    {

      let duplicateFound: boolean = false;
      let emptyFound: boolean = false;
      let sameObj: any = {};

      for (let item of this.tbody) {
        const rollno = item.student_roll_number?.rollno;

        if (rollno) {

          // TODO :- SAME FOUND
          if (sameObj.hasOwnProperty(rollno)) {

            item.isValid = false;
            item.isTouched = true;

            sameObj[rollno].isValid = false;
            sameObj[rollno].isTouched = true;

            duplicateFound = true;
          } else {  
            item.isValid = true;
            item.isTouched = true;
            sameObj[rollno] = item;
          }
        } else {   // TODO :- EMPTY ROLL NUMBER FOUND
          emptyFound = true;
          item.isValid = false;
          item.isTouched = true;
          // this.toastr.showError(`Please Enter Roll no for ${item.first_name}`);
        }
      }

      if (duplicateFound) {
        this.toastr.showError("Duplicate Roll Number Found ");
        return;
      }
      if (emptyFound) {
          this.toastr.showError(`Please Enter Valid Roll Number`);
        return;
      }
      
      this.batchService.saveRollNo({students : [this.tbody]}).subscribe((resp:any) => {
        if(resp?.status == true)
        {
          this.reloadData();
          this.toastr.showSuccess(resp.message);
          this.isSaveRollNo  = false;
        }else
        {
          this.toastr.showError(resp.message);
          this.isSaveRollNo  = false;
        }
      });
    }    
  }

  onInputChange(event: any,obj:any): void {
    obj.isTouched = true
    const value = event.target.value;
    this.isValidNumber = !isNaN(value) && value.trim() !== '';
    if (!this.isValidNumber) {
      event.target.value = '';
      obj.isValid = false
    }
    else{
      obj.rollno = Number(value);
      obj.isValid = true
    }
  }
  
  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  initForm() {
    this.rollNoForm = this._fb.group({
      section: [''],
      class: [null,[Validators.required]],
      batch: [ null,[Validators.required]],
      setting_value : [1]
    })

    this.rollNoForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
      this.rollNoForm.controls['batch'].markAsPristine();
      this.rollNoForm.controls['batch'].markAsUntouched();
    })
  }

  getSectionList() {
    this.batchService.getSectionList().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.sectionList = [{ id: '', name: 'All Section' }].concat(res.data);
        this.getClasses();
      }
    })
  }

  getClassList()
  {
    this.batchService.getClassList().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res?.status) {
        this.classList = res?.data;
      }
    })
  }
  //#endregion Private methods

}
