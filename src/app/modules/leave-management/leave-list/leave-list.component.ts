import { Component, OnChanges, OnInit,ViewChild } from '@angular/core';
import { LeaveManagmentService } from '../leave-managment.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from '../../../core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-leave-list',
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.scss']
})
export class LeaveListComponent implements OnInit {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  isLoader:boolean = false

  
  isOpenByClick: boolean = true

  tbody:any;
  p: number = 1;
  reasonForRejection='';
  type:number= 0
  title = 'appBootstrap'; 
  closeResult: string = '';
  generate = false;
  public branch = window.localStorage?.getItem("branch");
  isAdmin:boolean = localStorage.getItem('role')?.includes('ROLE_ADMIN') ?? false
  dtRender : boolean = false

  studentCollumn = [
    { title: 'Id', data: 'id' },
    { title: 'Name', data: 'name' },
    { title: 'Class', data: 'class' },
    { title: 'Batch', data: 'batch' },
    { title: 'Leave Type', data: 'leave_type' },
    { title: 'Duration', data: 'duration_type' },
    { title: 'Start Date', data: 'start_date' },
    { title: 'End Date', data: 'end_date' },
    { title: 'Status', data: 'status' },
    { title: 'Action', data: 'action', orderable: false, searchable: false, class:"action-btn-sticky" }
  ]

  facultyCollumn = [
    { title: 'Id', data: 'id' },
    { title: 'Name', data: 'name' },
    { title: 'Role', data: 'role' },
    { title: 'Leave Type', data: 'leave_type' },
    { title: 'Duration', data: 'duration_type' },
    { title: 'Start Date', data: 'start_date' },
    { title: 'End Date', data: 'end_date' },
    { title: 'Status', data: 'status' },
    { title: 'Action', data: 'action', orderable: false, searchable: false, class:"action-btn-sticky"}
  ]

  myLeaveCollumn = [
    { title: 'Id', data: 'id' },
    { title: 'Name', data: 'name' },
    { title: 'Leave Type', data: 'leave_type' },
    { title: 'Duration', data: 'duration_type' },
    { title: 'Start Date', data: 'start_date' },
    { title: 'End Date', data: 'end_date' },
    { title: 'Status', data: 'status' },
    { title: 'Action', data: 'action', orderable: false, searchable: false, class:"action-btn-sticky" }
  ]

  constructor(private leaveManagementSerivce:LeaveManagmentService, public datePipe: DatePipe,private modalService: NgbModal,
    private toastr: Toastr,
    public CommonService: CommonService,
    public activatedRouteService: ActivatedRoute,
  ){
  }

      /**
       * Write code on Method
       *
       * @return response()
       **/
    open(content:any,id:any) {
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        console.log(result);
        console.log(id);
        this.approve(id,2);
        let data = {id:id,status:2,reject_reason:this.reasonForRejection}
        this.leaveManagementSerivce.updateAdminLeave(data).subscribe((res:any) => {      
          console.log(res); 
          this.reloadData();
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

  // dtOptions: DataTables.Settings = {};
  // tableData:any = [
  //   {id: 1,firstName: "John", lastName: "Doe"},
  //   {id: 2,firstName: "Sian", lastName: "Frank"}
  // ]
  switch_to(type:any){
    this.type = type;
    this.dtRender = false
    this.dataTableInit();
    // this.reloadData();
  }

  URLConstants=URLConstants;
  ngOnInit(): void {
    this.isLoader = true
    setTimeout(() => {
      this.isLoader = false
      this.type = this.CommonService.hasPermission('leave_student_leave', 'has_access') ? 2 : this.CommonService.hasPermission('leave_faculty_leave', 'has_access') ? 1 : 3
      this.dataTableInit();
    }, 1000);
    $("#mymodal").css('z-index','0');
  }

  approve(id:number,status:number){
    let data = {id:id,status:status}
    this.leaveManagementSerivce.updateAdminLeave(data).subscribe((res:any) => {      
      if(res.status == false){
        this.toastr.showError(res.message);
      }
      this.reloadData();
    }), (error:any) => {
      console.log(error);
      this.toastr.showSuccess('Something went wrong.');
    }; 
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.leaveManagementSerivce.deleteStudentLeaveByAdmin(id).subscribe((res:any) => {      
        if(res.status){
          this.toastr.showSuccess(res.message);
        }
        this.reloadData();
      }), (error:any) => {
        console.log(error);
        this.toastr.showSuccess('Something went wrong.');
      };             
    }
  }

  // // tableData:any = []
  // loadData(){
  //   this.leaveManagementSerivce.getAllList({}).subscribe((res:any) => {
  //     this.tbody=res.data;  
  //   }); 
  // }

  getAdminFaculty(dataTablesParameters?: any, callback?:any ){
    console.log('here');
    
    Object.assign(dataTablesParameters,{type:this.type});
    this.leaveManagementSerivce.getAdminFacultyList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;            
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
    });
  }

  getMyLeaveList(dataTablesParameters?: any, callback?:any ){
    this.leaveManagementSerivce.getMyLeaveList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data; 
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
      dtInstance.columns(this.type === 3 ? this.myLeaveCollumn : (this.type === 2 ? this.studentCollumn : this.facultyCollumn))
    });
  }  

  paginatedRecords(url:any): void{
    this.leaveManagementSerivce.paginatedRecords(url).subscribe((res:any) => {  
      this.tbody = res.data;  
    });
  }  

  trackByFn(index:any, item:any) {
    return item.id; // or item.id
  };

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  download(id:number)
  {
    console.log('id',id);
    
    this.leaveManagementSerivce.download(id).subscribe(async(res:any) => {        
      if(res?.body?.type == 'application/json') {
        const data = JSON.parse(await res.body.text());
        if(data.status == false){
          this.toastr.showError(data.message);
        }
      } else {        
        this.downloadFile(res,'leaving-certificate', "pdf");        
      }  
      this.generate = false;    
    });
  }

  downloadFile(res: any,file: any, format:any) {
    let fileName = file;
    let blob:Blob = res.body as Blob;
    let pdfSrc = window.URL.createObjectURL(blob)
    if(format == 'pdf') {
      let iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfSrc;
      document.body.appendChild(iframe);
      iframe.contentWindow?.print();
    } else {
      let a = document.createElement('a');
      a.download = fileName;
      a.href =  pdfSrc
      a.click();
    }
    this.generate = false;
  } 

  dataTableInit() {
    const that = this

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200] ,
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      // scrollX: true,
      order: [[0, 'desc']],
      stateSaveCallback: function(settings,data) {
        localStorage.setItem('DataTables_' + URLConstants.LEAVES_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.LEAVES_LIST)
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
        if(this.type === 3) {
          this.getMyLeaveList(dataTablesParameters,callback);
        } else {
          this.getAdminFaculty(dataTablesParameters,callback)
        }
      },
     columns: this.type === 3 ? this.myLeaveCollumn : (this.type === 2 ? this.studentCollumn : this.facultyCollumn)
    };

    setTimeout(() => {
      this.dtRender = true;
    }, 0);
  }

}
