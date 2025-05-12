import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ResultService } from '../result.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-marksheet-template-list',
  templateUrl: './marksheet-template-list.component.html',
  styleUrls: ['./marksheet-template-list.component.scss']
})
export class MarksheetTemplateListComponent implements OnInit {
  //#region Public | Private Variables
  templates:any;
  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  loading:boolean = false;
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
      private resultService: ResultService,
      public CommonService: CommonService,
      private toastr : Toastr
  ) {}

  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getTemplatesList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  getTemplatesList(){
    this.loading = true;
    this.resultService.getTemplatesList().subscribe((response:any)=>{
      this.templates = response?.data;
      this.loading = false;
    })
  }

  delete(template:any){
    this.loading = true;
    this.resultService.deleteTemplate(template.id).subscribe((response:any)=>{
      if(response?.status){
        this.toastr.showSuccess(response?.message);
        this.templates = response?.data;
      }else{
        this.toastr.showError(response?.message);
      }
      this.loading = false;
    },(error:any)=>{
      this.toastr.showError(error?.error?.message);
      this.loading = false;
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  

  //#endregion Private methods

}
