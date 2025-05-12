import { Component, ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { Toastr } from '../../../core/services/toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { PollManagementService } from '../poll-management.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-poll-list',
  templateUrl: './poll-list.component.html',
  styleUrls: ['./poll-list.component.scss']
})
export class PollListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  public userDetails:any = ('; '+document.cookie)?.split(`; user=`)?.pop()?.split(';')[0];
  URLConstants = URLConstants;
  poll_list: any = [];
  userId:any = null;  
  stringMaxLength:number = 100;
  currentDate:any = null;
  userRole: any = [];
  batches: any = [];
  selectedBatches: any = [];
  classDropdownSettings: IDropdownSettings = {};
  sections = [{ id: '', name: 'All' }];
  params = {
    section: null,
  };

  constructor(
    private pollManagementService: PollManagementService,
    private datePipe: DatePipe,
    private toastr: Toastr,
    public CommonService: CommonService
  ) {
    const userDetailsDecodedData = decodeURIComponent(this.userDetails);
    const userDetailsJsonData = JSON.parse(userDetailsDecodedData);
    this.userId = (userDetailsJsonData) ? userDetailsJsonData?.userid : "";

    this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd');

    let userRollString = this.pollManagementService.getUserRoll();
    this.userRole = (userRollString ?? '').split(',');
  }  

  ngOnInit(): void {
    this.pollManagementService.getSectionList(this.sections).subscribe((res: any) => {
      if (res.status) {
        this.sections = this.sections.concat(res.data);
      }
    });

    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

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
        { data: 'type' }, 
        { data: 'date' },
        { data: 'start_date' }, 
        { data: 'end_date' },
        { data: 'total_votes' },
        { data: 'poll_for' },
        { data: 'status' },
        { data: 'action',orderable:false,searchable:false }
      ]
    };
  }

  getlist(dataTablesParameters?: any, callback?:any ){
    Object.assign(dataTablesParameters,{
      user_id:this.userId,
      ...this.params,
      batch:this.selectedBatches,
    });
    this.pollManagementService.getPollList(dataTablesParameters).subscribe((resp:any) => {
      this.poll_list = resp.data;
      //console.log("datatable response : ", this.poll_list);
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

  setDateFormat(date_value:any) {
    return this.datePipe.transform(date_value, 'yyyy-MM-dd');
  }

  getStringShorter(originalString:string) {
    return this.pollManagementService.setStringShorter(this.stringMaxLength, originalString);
  }

  getPollStatusStartedOrNotOrExpired(startDate:any, endDate:any) {
    return this.pollManagementService.getPollStatusStartedStatus(startDate, endDate, this.currentDate);
  }

  remove(id:any): void{
    if(confirm('are you sure you want to delete this poll ?')){
      this.pollManagementService.deletePoll(id).subscribe((res:any) => {
        this.reloadData(); 
      }); 
    }
  }

  onCheckboxChange(event: any) {
    const checkboxElement = event.target;
    const isChecked = checkboxElement.checked;
    const checkboxId = checkboxElement.id;
    
    if (isChecked) {
      this.updatePollStatus(checkboxId, 1);
    } else {
      this.updatePollStatus(checkboxId, 0);
    }
  }

  updatePollStatus(id:number, status:number): void {
    if(id){
      const param = {status:status};
      this.pollManagementService.pollStatusUpdate(param, id).subscribe((res:any) => {        
        if(res.status == true) {
          this.toastr.showSuccess(res.message);
        } else {
          this.toastr.showError(res.message);
        }
        this.reloadData();        
      },(err:any)=>{
        this.toastr.showError(err.error.message);
        this.reloadData();
      }); 
    }
  }

  //Custom URLs
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
  setUrlForAddVote(poll_id:string) {
    return '/'+window.localStorage.getItem("branch")+'/poll/'+poll_id+'/vote';
  }
  setUrlForShowVoteResult(poll_id:string) {
    return '/'+window.localStorage.getItem("branch")+'/poll/'+poll_id+'/result';
  }
  setUrlForPollResultDetail(poll_id:string) {
    return '/'+window.localStorage.getItem("branch")+'/poll/'+poll_id+'/result-detail';
  }

  sectionChange()
  { 
      this.pollManagementService.getBatchBySection(this.params.section).subscribe((res: any) => {
      this.batches = res;
      this.onBatchSelect();
    });
  }

  onBatchSelect() {
    this.reloadData();
  }

}
