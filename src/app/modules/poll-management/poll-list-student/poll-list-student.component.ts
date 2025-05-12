import { Component, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { Toastr } from '../../../core/services/toastr';
import { PollManagementService } from '../poll-management.service';

@Component({
  selector: 'app-poll-list-student',
  templateUrl: './poll-list-student.component.html',
  styleUrls: ['./poll-list-student.component.scss']
})
export class PollListStudentComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  public studentDetails:any = ('; '+document.cookie)?.split(`; studentDetails=`)?.pop()?.split(';')[0];
  URLConstants = URLConstants;
  poll_list: any = [];
  studentId: any = null;
  branchID: any = null;
  academicYear: any = null;
  stringMaxLength: number = 100;
  currentDate: any = null;

  constructor(
    private pollManagementService: PollManagementService,
    private datePipe: DatePipe,
    private toastr: Toastr
  ) {
    const studentDetailsDecodedData = decodeURIComponent(this.studentDetails);
    var keyValuePairs = studentDetailsDecodedData.split('|');
    var studentidValue = "";
    var studentbranchidValue = "";    

    for (var i = 0; i < keyValuePairs.length; i++) {
      var keyValue = keyValuePairs[i].split('=');
      if (keyValue[0] === 'studentid') {
        studentidValue = keyValue[1];
      } else if (keyValue[0] === 'studentbranchid') {
        studentbranchidValue = keyValue[1];
      }
    }
    this.studentId = studentidValue;
    this.branchID = studentbranchidValue;

    this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');   
  }

  ngOnInit(): void { 
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollCollapse:true,
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        this.getlist(dataTablesParameters,callback)
      },
      columns: [
        { data: 'title' },
        { data: 'description' },
        { data: 'date' },
        { data: 'start_date' },
        { data: 'end_date' },
        { data: 'total_votes' },
        { data: 'poll_for' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{
      student_id:this.studentId,
      branchID:this.branchID
    });
    this.pollManagementService.getPollList(dataTablesParameters).subscribe((resp:any) => {      
      this.poll_list = resp.data;
      //console.log("Poll list : ", this.poll_list);
      callback({
        recordsTotal: resp.recordsTotal,
        recordsFiltered: resp.recordsFiltered,
        data: []
      });
      setTimeout(() => {
        this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.columns.adjust();
        });
      }, 10);
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

  setUrlForGiveVote(poll_id:string) {
    return '/student/poll-student/'+poll_id+'/vote';
  }
  setUrlForShowResult(poll_id:string) {
    return '/student/poll-student/'+poll_id+'/result';
  }

  setDateFormat(date_value:any) {
    return this.datePipe.transform(date_value, 'yyyy-MM-dd');
  }

  getStringShorter(originalString:string) {
    return this.pollManagementService.setStringShorter(this.stringMaxLength, originalString);
  }

  getPollStatusStartedOrNotOrExpired(startDate:any, endDate:any) {
    return this.pollManagementService.getPollStatusStartedStatus(startDate, endDate, this.currentDate);
  }

}
