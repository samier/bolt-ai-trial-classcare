import { DatePipe } from '@angular/common';
import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from '../leave-managment.service';
import { DataTableDirective } from 'angular-datatables';
@Component({
  selector: 'app-student-leave-list',
  templateUrl: './student-leave-list.component.html',
  styleUrls: ['./student-leave-list.component.scss']
})
export class StudentLeaveListComponent {


  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  login_id:any=4;
  p: number = 1;
  constructor(private leaveManagementSerivce:LeaveManagmentService, public datePipe: DatePipe){
  }
  URLConstants=URLConstants;
  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'id' }, 
        { data: 'name'}, 
        { data: 'leave_type' }, 
        { data: 'start_date' }, 
        { data: 'end_date' }, 
        { data: 'status' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };

  }


  loadData(dataTablesParameters?: any, callback?:any ){
    this.leaveManagementSerivce.getStudentList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;            
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }


  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  delete(id:number){
    let c = confirm("Are you sure? You want to delete it ?");
    if(c){
      this.leaveManagementSerivce.deleteStudentLeave(id).subscribe((res:any) => {      
        console.log(res); 
        this.loadData();
      });             
    }
  }  
}
