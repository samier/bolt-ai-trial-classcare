import { Component,OnInit,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Subject } from 'rxjs/internal/Subject';
import { CommonService } from 'src/app/core/services/common.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  //#region Public | Private Variables
  
  URLConstants = URLConstants;
  $destroy: Subject<void> = new Subject<void>();
  type:number = 1;
  filterDropdown: boolean = false;
  isAdmin: boolean = false;
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
  ) {
  }
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    const roles = localStorage.getItem('role');
    if (roles) {
      this.isAdmin = roles === 'ROLE_ADMIN' || roles.includes('ROLE_ADMIN');
    }
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

	
  //#endregion Private methods
}