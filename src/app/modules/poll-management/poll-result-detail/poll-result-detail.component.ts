import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { Toastr } from '../../../core/services/toastr';
import { DataTableDirective } from 'angular-datatables';
import { PollManagementService } from '../poll-management.service';

@Component({
  selector: 'app-poll-result-detail',
  templateUrl: './poll-result-detail.component.html',
  styleUrls: ['./poll-result-detail.component.scss']
})
export class PollResultDetailComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  public userDetails:any = ('; '+document.cookie)?.split(`; user=`)?.pop()?.split(';')[0];
  URLConstants = URLConstants;
  poll_result_detail: any = [];
  poll_data: any = [];
  userId:any = null;
  id: any = null;
  totalVote: any = null;
  pollFor: any = null;
  pollExpiredStatus: any = null;
  currentDate:any = null;
  pollDataNullTrue: boolean = false;

  constructor(
    private router: Router,
    private activatedRouteService: ActivatedRoute,
    private pollManagementService: PollManagementService,
    private datePipe: DatePipe,
    private toastr: Toastr
  ) {
    const userDetailsDecodedData = decodeURIComponent(this.userDetails);
    const userDetailsJsonData = JSON.parse(userDetailsDecodedData);
    this.userId = (userDetailsJsonData) ? userDetailsJsonData?.userid : "";
  }

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['poll_id'];

    this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');

    this.pollManagementService.getPollRecord(this.id).subscribe((res:any) => { 
        //console.log('Response poll : ', res);
        this.poll_data = res?.data[0];
        if(this.poll_data) {
          this.totalVote = this.poll_data?.total_votes;
          this.pollFor = this.pollManagementService.getPollFor(this.poll_data?.poll_for);
          this.pollExpiredStatus = this.pollManagementService.getPollStatusStartedStatus(this.poll_data?.start_date, this.poll_data?.end_date, this.currentDate);
        }
    });

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
        { data: 'user' },
        { data: 'answer' },  
        { data: 'type' },
        { data: 'date' },
        { data: 'is_user' }
      ]
    };

  }

  getlist(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{
      user_id:this.userId
    });
    this.pollManagementService.getPollVoteResultDetails(dataTablesParameters, this.id).subscribe((resp:any) => {
      this.poll_result_detail = resp.data;
      //console.log("datatable response : ", this.poll_result_detail);
      this.pollDataNullTrue = false; 
      if(this.poll_result_detail.length == 0) {
        this.pollDataNullTrue = true; 
        //console.log("poll data null : ", this.poll_result_detail);
      }
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

  setPollType(type:any) {
    return this.pollManagementService.getPollType(type);
  }

}
