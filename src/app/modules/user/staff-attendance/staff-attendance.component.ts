import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../user.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import moment from 'moment';
import { Toastr } from 'src/app/core/services/toastr';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-staff-attendance',
  templateUrl: './staff-attendance.component.html',
  styleUrls: ['./staff-attendance.component.scss']
})
export class StaffAttendanceComponent implements OnInit {

  //-----------------------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  //-----------------------------------------------------------------------------------------------------------------------------

  filteredPost: any = [];
  search: any = ""
  roles: any = [];
  submitted: boolean = false;
  URLConstants = URLConstants;
  maxDate: string | undefined;
  tableData: any
  formSubmit: boolean = false;
  valid: boolean = false;
  is_saveAttendance: boolean = false;
  user_id: any = window.localStorage.getItem('user_id');
  params: any = {
    branch_id: window.localStorage.getItem("branch"),
    role_id: null,
    start_date: null,
  }

  roleName: any = ""

  is_selected: boolean = true
  is_show: boolean = false 
  is_update: boolean = false 

  $destroy: Subject<void> = new Subject<void>();

  //-----------------------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  //-----------------------------------------------------------------------------------------------------------------------------
  
  
  //-----------------------------------------------------------------------------------------------------------------------------
  // #region constructor
  //-----------------------------------------------------------------------------------------------------------------------------
  constructor(
    private UserService: UserService,
    private toastr: Toastr,
    public CommonService: CommonService,
  ) {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }
  //-----------------------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  //-----------------------------------------------------------------------------------------------------------------------------
  
  //-----------------------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  //-----------------------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    
    this.UserService.getRoleList().subscribe((resp: any) => {
      if (resp.status) {
        this.roles = resp.data
      }
    })
    
    this.params.start_date = this.getDate()
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //-----------------------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  //-----------------------------------------------------------------------------------------------------------------------------
  
  //-----------------------------------------------------------------------------------------------------------------------------
  // #region Public methods
  //-----------------------------------------------------------------------------------------------------------------------------
  
  onSubmit() {
    
    this.formSubmit = true

    // this.filteredPost,length > 0  ? this.submitted = true : this.submitted = false
    if (this.params.role_id && this.params.start_date) {
      this.is_selected = false
      this.getAttendanceList()
      this.formSubmit = false
    }
    else {
      this.submitted = false
      return
    }
  }

  getAttendanceList() {

    this.is_show = true
    this.submitted = true
    
    const payload = {
      ...this.params,
      user_id : this.user_id,
      start_date: moment(this.params?.start_date).format('DD-MM-YYYY')
    }

    this.UserService.getAttendanceList(payload).subscribe((resp: any) => {
      if (resp.status) {

        // if (resp.data instanceof Array) {
        //   this.toastr.showError(resp.message)
        //   this.submitted = false
        //   this.is_selected = true
        //   return 
        // }
        this.tableData = resp.data

        this.tableData = this.tableData?.map((item: any) => ({
          ...item,
          status: item?.status || 'p',
          notes: item?.notes || "",
        }));
        this.roleName = this.roles?.find((item: any) => item?.id == this.params?.role_id)?.name
        this.filteredPost = this.tableData
        this.is_update = resp.attendance
        this.submitted = false
        this.is_show = false
      }else{
        this.is_show = false
        this.submitted = false
        this.toastr.showError(resp.message)
      }
    },(error:any)=>{
      this.is_show = false
      this.submitted = false
      this.toastr.showError(error?.error?.message ?? error?.message)
    })
  }

  tableSubmit() {
    this.is_saveAttendance = true
    const attendance = this.tableData?.map((item: any) => {
      return {
        user_id: item.id,
        status: item.status,
        notes: item.notes,
        leave_type: "",
        paid_unpaid: 0
      };
    })
    const params = {
      branch_id: window.localStorage.getItem("branch"),
      start_date: moment(this.params?.start_date).format('DD-MM-YYYY'),
      user: attendance
    }
    
    this.valid = true;

    if (this.valid) {
      this.addaAtendance(params)
    }
  }

  addaAtendance(payload: any) {
    
    this.UserService.saveAttendance(payload).subscribe((res: any) => {
      if (res.status == false) {
        this.toastr.showError(res.message);
        this.is_saveAttendance = false
        
      } else {
        this.is_update ? this.toastr.showSuccess("Attendance Update Successfully") : this.toastr.showSuccess("Attendance Save Successfully") ;
        this.valid = false
        this.clearAll()
      }
    })
  }
  
  clearAll(){
    this.formSubmit = false
    this.is_selected = true
    this.is_show = false
    this.tableData = []
    this.filteredPost = []
    this.params.role_id = null
    this.params.start_date = this.getDate()
    this.search = ""
    this.submitted = false
    this.is_saveAttendance = false
  }

  searchData() {

    if (!this.search) {
      this.filteredPost = this.tableData
    } else {
      this.filteredPost = this.tableData?.filter(post =>
        post.name.toLowerCase().includes(this.search.toLowerCase()))
    }
  }
  //-----------------------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  //-----------------------------------------------------------------------------------------------------------------------------
  
  //-----------------------------------------------------------------------------------------------------------------------------
  //#region Private methods
  //-----------------------------------------------------------------------------------------------------------------------------
  getDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    
    return formattedDate
  }
  
  //-----------------------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  //-----------------------------------------------------------------------------------------------------------------------------

}