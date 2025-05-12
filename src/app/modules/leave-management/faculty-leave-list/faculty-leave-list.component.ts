import { Component ,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from '../leave-managment.service';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-faculty-leave-list',
  templateUrl: './faculty-leave-list.component.html',
  styleUrls: ['./faculty-leave-list.component.scss']
})
export class FacultyLeaveListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  login_id:any=4;
  p: number = 1;
  constructor(private leaveManagementSerivce:LeaveManagmentService, public CommonService: CommonService){
  }

  URLConstants=URLConstants;
  ngOnInit(): void {

    //this.loadData();
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
    this.leaveManagementSerivce.getFacultyList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;            
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }  
  // paginatedRecords(url:any): void{
  //   this.leaveManagementSerivce.paginatedRecords(url).subscribe((res) => {  
  //     this.tbody = res;  
  //   });
  // }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }  

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.leaveManagementSerivce.deleteFacultyLeave(id).subscribe((res:any) => {      
        console.log(res); 
        this.reloadData();
      });             
    }
  }  
}
