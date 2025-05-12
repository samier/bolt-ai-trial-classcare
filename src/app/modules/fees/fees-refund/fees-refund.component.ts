import { Component, ViewChild, OnInit} from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HraService } from 'src/app/modules/hra/hra.service';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-fees-refund',
  templateUrl: './fees-refund.component.html',
  styleUrls: ['./fees-refund.component.scss']
})
export class FeesRefundComponent implements OnInit{
  URLConstants = URLConstants;

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  tbody:any;
  constructor(private hraSerivce:HraService){
  }
  dropdownList:any = [];
  selectedItems:any = [];
  dropdownSettings:IDropdownSettings = {
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };
  Authority: any = [
    {id:1,name:"Authority 1"},
    {id:2,name:"Authority 2"},
    {id:3,name:"Authority 3"},
  ];
  ngOnInit() {
    this.dropdownList = [
      { item_id: 1, item_text: 'Mumbai' },
      { item_id: 2, item_text: 'Bangaluru' },
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' },
      { item_id: 5, item_text: 'New Delhi' }
    ];
    this.selectedItems = [
    ];
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      searching: true,
      scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
     columns: [
        { data: 'full_name' }, 
        { data: 'email' }, 
        { data: 'roles' },  
        { data: 'roles' }, 
        { data: 'roles' }, 
        { data: 'roles' }, 
        { data: 'roles' }, 
        { data: 'roles' }, 
        { data: 'action',orderable:false,searchable:false },
      ]
    };     
  }

  
  loadData(dataTablesParameters?: any, callback?:any ){
    this.hraSerivce.getUserList(dataTablesParameters).subscribe((resp:any) => {
      this.tbody = resp.data;   
      console.log(this.tbody);         
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

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
}
