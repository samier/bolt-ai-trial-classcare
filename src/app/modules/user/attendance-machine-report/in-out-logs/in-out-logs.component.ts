import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { UserService } from '../../user.service';
import { DateFormatService } from 'src/app/service/date-format.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-in-out-logs',
  templateUrl: './in-out-logs.component.html',
  styleUrls: ['./in-out-logs.component.scss']
})
export class InOutLogsComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();  
  user_id: any;
  indexStart: any = 1;
  tbody: any;

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private toastr: Toastr,
    public dateFormateService: DateFormatService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.user_id = this.activatedRoute.snapshot.params['id'];
    this.loadData();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  loadData(dataTablesParameters?: any, callback?: any){
    const payload = {
      ...dataTablesParameters,
      id: this.user_id
    }
    this.userService.getInOutLogsByUser(payload).subscribe((res: any) => {
      this.tbody = res?.data;
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.error?.error ?? 'An Unexpected Error Occurred');
    })
  }
	
  //#endregion Private methods
}