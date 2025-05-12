import { Component } from '@angular/core';
import { Toastr } from '../../../core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { TransportService } from '../transport.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CommonService } from 'src/app/core/services/common.service';


@Component({
  selector: 'app-transport-settings',
  templateUrl: './transport-settings.component.html',
  styleUrls: ['./transport-settings.component.scss']
})
export class TransportSettingsComponent {
  constructor(
      private toastr: Toastr,
      private transportService: TransportService,
  public CommonService: CommonService
  ) {}

  URLConstants = URLConstants;
  classDropdownSettings: IDropdownSettings = {};
  selectedMonths: any = [];
  branch: any = [];
  months: any = [
    {'id':'january', 'name':'January'},
    {'id':'february', 'name':'February'},
    {'id':'march', 'name':'March'},
    {'id':'april', 'name':'April'},
    {'id':'may', 'name':'May'},
    {'id':'june', 'name':'June'},
    {'id':'july', 'name':'July'},
    {'id':'august', 'name':'August'},
    {'id':'september', 'name':'September'},
    {'id':'october', 'name':'October'},
    {'id':'november', 'name':'November'},
    {'id':'december', 'name':'December'}
  ];

  ngOnInit(): void {
    this.transportService.getTransportSetting().subscribe((res:any) => {
      let months = this.months.filter((item:any) => res.data.months.includes(item.id));
      this.selectedMonths = months;
      this.branch = res.data.branch;
    }); 

    this.classDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 12,
      allowSearchFilter: true
    };
  }

  submit(): void{
    let months = this.selectedMonths.map((item:any) => item.id);
    this.transportService.saveTransportSetting({'months':months}).subscribe((res:any) => {  
      this.toastr.showSuccess(res.message); 
    },(err:any)=>{
      this.toastr.showError(err.error.message);
    }); 
  }
}
