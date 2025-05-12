import { Component,ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { UserService } from '../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { DataTableDirective } from 'angular-datatables';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';
import { AttendanceManagementService } from '../../attendance-management/attendance-management.service';
import { ExamServiceService } from '../../exam/exam-service.service';

@Component({
  selector: 'app-assingn-subjects',
  templateUrl: './assingn-subjects.component.html',
  styleUrls: ['./assingn-subjects.component.scss']
})
export class AssingnSubjectsComponent {


  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  submitted:any=false;
  allChecked:boolean = false;
  selectedUserSubjectIds: Set<number> = new Set();
  isDeleteAllLoading: boolean = false;
  public user_id:any=0;
  public valid = true;
  public tbody:any=[];
  public branch_id = window.localStorage?.getItem("branch");
  public username='User';

  public ClassNames=[];
  public selectedClass='';

  public Batches=[];
  public selectedBatch:any='';

  public Subjects=[];
  public selectedSubject='';

  // rolecreateform: FormGroup;
  productForm: FormGroup;
  addedLeaveType:any=[];
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  constructor(
    private UserService: UserService,private router:Router,private route: ActivatedRoute,private fb:FormBuilder, private toastr: Toastr,public CommonService : CommonService,
    private activatedRouteService: ActivatedRoute, private _attendanceManagementService : AttendanceManagementService,
    private _examService : ExamServiceService
  ) {
    this.user_id = this.route.snapshot.paramMap.get('id');

    this.productForm = new FormGroup({
      class_id: new FormControl(''),
      batch_id: new FormControl('',[Validators.required]),
      subject_id: new FormControl('',[Validators.required]),
    });
  }

  ngOnInit() {
    this.setUserName();
    this.getClassList();
    const that = this;
    this.handleClassChange([])
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200] ,
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      scrollX: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.ASSIGN_SUBJECT_USER, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.ASSIGN_SUBJECT_USER)
          let dataTableState = JSON.parse(state)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters,{user_id:this.user_id});
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'checkbox',orderable:false,searchable:false },
        { data: 'batch' },
        { data: 'subject' },
        { data: 'class' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
    // this.getSubjectAndBatchListByClassId();

  }
  URLConstants = URLConstants;

  changeFn(val:any){
    this.selectedBatch   ='';
    this.selectedSubject ='';
    // this.getSubjectAndBatchListByClassId(val);
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }


  onSubmit() {
    let data = this.productForm.value;
    Object.assign(data,{user_id:this.user_id})
    this.UserService.assignSubjectStore(data).subscribe((res:any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }
      if(res.status==true){
        this.reloadData();
        this.resetFilter()
        this.productForm.reset();
        this.selectedClass='';
        this.selectedBatch='';
        this.selectedSubject='';
        this.toastr.showSuccess(res.message);
      }
    });
  }

  getClassList(){
    const payload = {
        user_id : this.user_id, 
    }
    this._examService.getClassFilterList(payload).subscribe((res: any) => {
      if(res.status==false){
        this.toastr.showError(res.message);
      }else{
        this.ClassNames = res.data;
      }
    });
  }

    getSubjectAndBatchListByClassId(){
      let data = {
        user_id : this.user_id
      }
      this.UserService.getBatchList().subscribe((res:any) => {        
        if(res.status==false){
          this.toastr.showError(res.message);
        }else{
          this.Batches  = res.data;
          // this.Subjects = res.data.subject;
        }
      });
    }

    loadData(dataTablesParameters?: any, callback?:any ){
      this.UserService.getAssignSubjectList(dataTablesParameters).subscribe((resp:any) => {
        this.tbody = resp.data;
        this.allChecked = false;
        this.selectedUserSubjectIds.clear();
        callback({
          recordsTotal: resp.recordsTotal,
          recordsFiltered: resp.recordsFiltered,
          data: []
        });
      });
    }

    reloadData() {
      this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
      });
    }

    delete(id:number){
      let c = confirm("Are you sure ? You want to delete it ?");
      if(c){
        this.UserService.deleteAssignSubjectRecord(id).subscribe((res:any) => {
          if(res?.status){
            this.toastr.showSuccess(res?.message);
            this.reloadData();
            this.resetFilter();
          }else{
            this.toastr.showError(res?.message);
          }
        },(error: any)=> {
          this.toastr.showError(error?.error?.message ?? error?.message)
        });
      }
    }

    deleteSelected(){

      if(this.selectedUserSubjectIds?.size === 0){
        return this.toastr.showError("Please Select subject");
      }
      const conf = confirm("Are you sure ? You want to delete it ?");
      if(conf){
        const payload = {
          "ids": Array.from(this.selectedUserSubjectIds)
        }
        this.isDeleteAllLoading = true;
        this.UserService.deleteSelectedAssignSubjectRecord(payload).subscribe((res:any) => {
          this.isDeleteAllLoading = false;
          if(res?.status) {
            this.toastr.showSuccess(res?.message)
            this.reloadData();
            this.resetFilter()
          } else {
            this.toastr.showError(res?.message)
          }
        },(error: any)=> {
          this.isDeleteAllLoading = false;
          this.toastr.showError(error?.error?.message ?? error?.message)
        });
      }
    }

    setUserName(){
      this.UserService.getUserName(this.user_id).subscribe((res:any) => {
        if(res.status==true){
         this.username=res.data.full_name;
        }
      });
    }

    handleBatchChange(event:any = []){
      this.selectedSubject = ''
      this.Subjects = []
      if(event?.length > 0) {
        let data = {
          batch : event.map((item:any) => item.id),
          user_id : this.user_id
        }
        this.UserService.getSubjectList(data).subscribe((resp:any) => {
          if(resp.status){
            this.Subjects = resp.data;
          }
        })
      }
    }

  handleClassChange(event: any = []) {
    this.selectedSubject = ''
    this.selectedBatch = []
    this.Batches = []
    this.Subjects = []
    let ids = []
    if (event?.length > 0) {
       ids = event.map((item: any) => item.id)
    }
    if(ids.length > 0) {
      const payload = {
        classes: ids , 
        user_id : this.user_id
      }
      this._attendanceManagementService.getBatchesList(payload).subscribe((res: any) => {
        if (res.status == false) {
          this.toastr.showError(res.message);
        } else {
          this.Batches = res.data;
          // this.Subjects = res.data.subject;
        }
      });
    } else {
      this.Batches = [];
    }
  }

  /**
   * Handle select all
   * @param event
   */
  handleSelectAll(event: any) {
    const checked = event.target.checked;
    this.tbody.forEach(userSubject => {
      userSubject.selected = checked;
      if (checked) {
        this.selectedUserSubjectIds.add(userSubject.id);
      } else {
        this.selectedUserSubjectIds.delete(userSubject.id);
      }
    });
  }

  /**
   * Handle single select
   * @param event
   * @param id
   */
  handleSelect(event: any, id: any) {
    if (event.target.checked) {
      this.selectedUserSubjectIds.add(id);
    } else {
      this.selectedUserSubjectIds.delete(id);
    }
    this.allChecked = this.selectedUserSubjectIds.size == this.tbody?.length;
  }

  resetFilter() {
    this.selectedClass = ''
    this.selectedBatch = ''
    this.selectedSubject = ''
  }
}
