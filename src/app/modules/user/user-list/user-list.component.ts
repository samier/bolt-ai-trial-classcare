import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { UserService } from '../user.service';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  
  isOpenByClick: boolean = true

  tbody:any;
  userType = [
    { id: '', name: 'All' },
    { id: '0', name: 'Is Admin' },
    { id: '1', name: 'Is Faculty' },
    { id: '2', name: 'IS administrator' },
    { id: '3', name: 'Both' },
    { id: '4', name: 'Is Driver' },
  ];
  batches:any = [ { id: "", name: 'All' },];
  subjects:any = [ { id: "", name: 'All' },];
  roles:any = [ { id: "", name: 'All' },];
  selectedUserType='';
  params:any = {
    userType: "",
    role: "",
    batch: "",
    subject: "",
  };
  public type;
  constructor(private userSerivce:UserService,private activatedRouteService: ActivatedRoute, private toaster:Toastr, public commonService: CommonService, public CommonService : CommonService, private router:Router,){
  }
  URLConstants=URLConstants;
  ngOnInit(): void {

    let params:any = localStorage.getItem('user_params');
    params = JSON.parse(params);

    if(params){
      this.params = params
    }
    this.activatedRouteService.params.subscribe((res: any)=> {
      this.type = res?.type
      if(this.type == 'driver'){
        this.params.userType = '4';
        this.params.role = "" ;
        this.reloadData();
      }else if(this.type == 'warden'){
        this.params.userType = '5';
        this.params.role = "" ;
        this.reloadData();
      }
      else{
        this.params.userType = "";
        this.params.role = "" ;
        this.reloadData()
      }
    })

    if(this.params.userType == 4){
      this.router.navigate([this.setUrl(URLConstants.DRIVER_LIST)]);
    }else if(this.params.userType == 5){
      this.router.navigate([this.setUrl(URLConstants.WARDEN_LIST)]);
    }
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200] ,
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      // scrollX: true,
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          userType : that.params.role,
          batch    : that.params.batch ,
          subject  : that.params.subject ,
        })
        localStorage.setItem('DataTables_' + URLConstants.USER_LIST, JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_' +  URLConstants.USER_LIST)
          let dataTableState = JSON.parse(state)
          that.setFormState(dataTableState)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'emp_no', width: '100px' },
        { data: 'full_name', width: '200px', },
        { data: 'roles', width: '200px',orderable:false,searchable:false },
        { data: 'email',  width: '250px' },
        { data: 'phone_number',orderable:false,searchable:false },
        { data: 'action',orderable:false,searchable:false },
      ]
    };

    this.getBatchList();
    this.getSubjectList();
    this.getRoleList();

  }
  setFormState(state) {
    this.params.role = state?.userType
    this.params.batch = state?.batch
    this.params.subject = state?.subject
  }

  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
    };
    localStorage.setItem('user_params', JSON.stringify(this.params));
    this.userSerivce.getUserList(dataTablesParameters).subscribe((resp:any) => {
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
    });
  }
  userTypeChange(){
    // this.userSerivce.getUserList(this.params.userType).subscribe((res: any) => {
      this.reloadData();
    // });
  }
  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.userSerivce.deleteUser(id).subscribe((res:any) => {
        //console.log(res);
        this.reloadData();
      });
    }
  }

  getBatchList(){
    this.userSerivce.getBatchList().subscribe((resp:any) => {
      if(resp.status){
        this.batches = [...[{ id: "", name: 'All' }] , ...resp.data]
      }
    })
  }

  handleBatchChange(){
    this.params.subject = "";
    this.reloadData();
    this.getSubjectList();
  }

  getSubjectList(){
    let data = {
      batch: this.params.batch ? [this.params.batch] : [],
    };
    this.userSerivce.getSubjectList(data).subscribe((resp:any) => {
      if(resp.status){
        this.subjects = [...[{ id: "", name: 'All' }] , ...resp.data]
      }
    })
  }

  user_batches(subjects){

    let subject:any = []
    subjects.filter((x:any) => {
      subject.push(' '+ x.name + ' ')
    })
    return subject.join('|');
  }

  getRoleList(){
    this.userSerivce.getRoleList().subscribe((resp:any) => {
      if(resp.status){
        this.roles = [...[{ id: "", name: 'All' }] , ...resp.data]
      }
    })
  }

  downloadExcel(format: any){

    const payload = {
      "type" : "users",
    }
    this.toaster.showInfo("Please Wait!", "Downloading your file!");
    this.userSerivce.getExcel(payload).subscribe(
      (res: any) => {
        this.commonService.downloadFile(res, 'users-attendance-id', format);
      },
      (error)=> {
        this.toaster.showError(error?.error?.message ?? error?.message);
      });
  }
}
