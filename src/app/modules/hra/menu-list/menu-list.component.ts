import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { HraService } from '../hra.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.scss']
})
export class MenuListComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  constructor(private hraSerivce:HraService){
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
        { data: 'name' }, 
        { data: 'action',orderable:false,searchable:false }
      ]
    };     
  }


  loadData(dataTablesParameters?: any, callback?:any ){
    this.hraSerivce.getMenuList(dataTablesParameters).subscribe((resp:any) => {
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

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  delete(id:number){
    let c = confirm("Are you sure ? You want to delete it ?");
    if(c){
      this.hraSerivce.deleteRecord(id).subscribe((res:any) => {      
        //console.log(res); 
        this.reloadData();
      });             
    }
  }
}
