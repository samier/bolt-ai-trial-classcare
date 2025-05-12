import { Component, OnInit } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { UserService } from '../../user/user.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Subject } from 'rxjs';
import { UserServiceService } from '../user-service.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-user-branch-list',
  templateUrl: './user-branch-list.component.html',
  styleUrls: ['./user-branch-list.component.scss']
})
export class UserBranchListComponent implements OnInit {

  private API_URL = enviroment.apiUrl;
  private symfonyHost = enviroment.symfonyHost;
  public URLConstants = URLConstants;

  $destroy: Subject<void> = new Subject<void>();
  
  // branchList : Array<object> = []
  branchList : any = []
  defaultImage :string = "http://newtest.classcare.in/public/upload/branchImage/newbranch.png"

  branchID : any = null
  public is_admin   = window.localStorage?.getItem("role")?.includes('ROLE_ADMIN');
  userID : any = window.localStorage.getItem('user_id');
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public userService : UserServiceService,
    private _toaster : Toastr,
  ) { }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.getBranchList()
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  getBranchList(){
    this.userService.getBranchList(this.userID).subscribe((res:any)=>{
      if(res?.status){
        this.branchList = res?.data
      }
      else{
        this._toaster.showError(res.message)
      }
    },(error:any)=>{
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }
  setsymfonyUrl(url:string) {
    return this.symfonyHost+url;
  }
  setUrl(url : string , brachID : any = null) {
    if(!brachID){
      return '/'+url
    } 
    return '/' + brachID + '/dashboard';
  }
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

}

