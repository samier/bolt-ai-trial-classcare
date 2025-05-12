import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { LeaveManagmentService } from '../leave-managment.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-faculty-student-leave-list',
  templateUrl: './faculty-student-leave-list.component.html',
  styleUrls: ['./faculty-student-leave-list.component.scss']
})
export class FacultyStudentLeaveListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  login_id:any=1;
  p: number = 1;
  reasonForRejection='';
  closeResult: string = '';
  constructor(private leaveManagementSerivce:LeaveManagmentService,private modalService: NgbModal, public CommonService: CommonService,public toastr:Toastr){
  }


    /**
       * Write code on Method
       *
       * @return response()
       */
    open(content:any,id:any) {
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        console.log(result);
        console.log(id);
        // this.approve(id,2);
        let data = {id:id,status:2,reject_reason:this.reasonForRejection}
        this.leaveManagementSerivce.updateAdminLeave(data).subscribe((res:any) => {      
          console.log(res); 
          this.reloadData();
          this.toastr.showSuccess('Leave Rejected Successfully');
        });         
        console.log('saved');
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        console.log('canceled');
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    } 
      
    /**
     * Write code on Method
     *
     * @return response()
     */
    private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
      } else {
        return  `with: ${reason}`;
      }
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
        { data: 'user_type'}, 
        { data: 'class'}, 
        { data: 'batch'},         
        { data: 'leave_type' }, 
        { data: 'start_date' }, 
        { data: 'end_date' }, 
        { data: 'status' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };    
  }



  approve(id:number,status:number){
    let data = {id:id,status:status}
    this.leaveManagementSerivce.updateAdminLeave(data).subscribe((res:any) => {      
      console.log(res); 
      this.reloadData();
      this.toastr.showSuccess('Leave Approved Successfully');
    }); 
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.leaveManagementSerivce.deleteStudentLeaveByAdmin(id).subscribe((res:any) => {      
        console.log(res); 
        this.reloadData();
      });             
    }
  }
    

  loadData(dataTablesParameters?: any, callback?:any ){
    this.leaveManagementSerivce.getLeaveListByApproverId(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;            
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }  


  paginatedRecords(url:any): void{
    this.leaveManagementSerivce.paginatedRecords(url).subscribe((res) => {  
      this.tbody = res;  
    });
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }  



  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
