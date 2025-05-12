import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { UserService } from '../user.service';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { LoaderService } from 'src/app/core/services/loader-service';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.scss']
})
export class AdminUserListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  userType = [
    { id: '', name: 'All' },
    { id: '0', name: 'Is Admin' },
    { id: '1', name: 'Is Faculty' },
    { id: '2', name: 'IS administrator' },
    { id: '3', name: 'Both' },
    { id: '4', name: 'Is Driver' },
  ];
  batches:any = [ { id: null, name: 'All' },];
  subjects:any = [ { id: null, name: 'All' },];
  roles:any = [ { id: null, name: 'All' },];
  selectedUserType='';
  params:any = {
    branches : [],
    sections: [],
    role: null,
    userType: null,
  };

  branchDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'branchName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  sectionDropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  sections:any = [];
  branches:any = [];

  public type;
  constructor(private userSerivce:UserService,private activatedRouteService: ActivatedRoute, public CommonService : CommonService, private router:Router,
    private loaderService: LoaderService
  ){
  }
  URLConstants=URLConstants;
  ngOnInit(): void {
    this.loaderService.setLoading(false)
    let params:any = localStorage.getItem('user_params');
    params = JSON.parse(params);

    if(params){
      this.params = params
    }
    this.activatedRouteService.params.subscribe((res: any)=> {
      this.type = res?.type
      if(this.type == 'driver'){
        this.params.userType = '4';
        this.params.role = null ;
        this.reloadData();
      }else if(this.type == 'warden'){
        this.params.userType = '5';
        this.params.role = null ;
        this.reloadData();
      }
      else{
        this.params.userType = '';
        this.params.role = null ;
        this.reloadData()
      }
    })

    if(this.params.userType == 4){
      this.router.navigate([this.setUrl(URLConstants.DRIVER_LIST)]);
    }else if(this.params.userType == 5){
      this.router.navigate([this.setUrl(URLConstants.WARDEN_LIST)]);
    }

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      // scrollX: true,
      stateSaveCallback: function(settings,data) {
        localStorage.setItem( 'dataTables_users_list', JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        let state:any = localStorage.getItem( 'dataTables_users_list')
          return JSON.parse(state)
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'full_name', width: '200px', },
        { data: 'email',  width: '250px' },
        { data: 'user_batch' },
        { data: 'action',orderable:false,searchable:false },
      ]
    };

    this.getBranchList();
    this.getRoleList();

  }


  loadData(dataTablesParameters?: any, callback?:any ){
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.params,
    };
    localStorage.setItem('user_params', JSON.stringify(this.params));

    this.userSerivce.getAdminUserList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;
      //console.log(this.tbody);
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
    return '/'+url;
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
        this.batches = [...[{ id: null, name: 'All' }] , ...resp.data]
      }
    })
  }

  handleBatchChange(){
    this.params.subject = null;
    this.reloadData();
    this.getSubjectList();
  }

  getSubjectList(){
    let data = {
      batch: this.params.batch ? [this.params.batch] : [],
    };
    this.userSerivce.getSubjectList(data).subscribe((resp:any) => {
      if(resp.status){
        this.subjects = [...[{ id: null, name: 'All' }] , ...resp.data]
      }
    })
  }

  user_batches(subjects){

    let subject:any = []
    subjects.filter((x:any) => {
      subject.push('  '+x?.batch?.name+'-'+x?.subject?.name+'  ')
    })
    return subject.join('|');
  }

  getRoleList(){
    this.userSerivce.getRoleListForAdmin().subscribe((resp:any) => {
      if(resp.status){
        this.roles = [...[{ id: null, name: 'All' }] , ...resp.data]
      }
    })
  }

  getBranchList(){
    this.userSerivce.getBranchList().subscribe((resp:any) => {
      this.branches = resp.data;
    })
  }

  handleBranchChange(type?:any){
    if(type != 'template'){
      this.params.sections = []
      this.sections = [];
    }

    let data = {
      branches : this.params.branches.map((x:any) => x.id)
    }
    this.userSerivce.getSections(data).subscribe((res: any) => {
      if (res.status) {
        this.sections = res.data;
      }
    });
    this.reloadData();
  }
}
