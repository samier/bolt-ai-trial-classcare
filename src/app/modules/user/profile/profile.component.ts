import { Component,ViewChild } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { UserService } from '../user.service';
import { DataTableDirective } from 'angular-datatables';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;

  constructor(private userSerivce:UserService,
    private activatedRouteService: ActivatedRoute,
    public CommonService : CommonService){
  }

  tab = 'profile';
  user_id = null;
  userDetail:any = null;
  URLConstants=URLConstants;
  ngOnInit(): void {
    this.user_id = this.activatedRouteService.snapshot.params['id'];
    this.getProfileDetails();
    
  }

  

  getProfileDetails(){
    this.userSerivce.getUserDetail(this.user_id).subscribe((resp:any) => {
      if(resp.status){
        this.userDetail = resp.data
      }
    })
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }

  handleTab(value:any){
    this.tab = value;
  }

  getRoles(roles:any){
    return roles.map(item => item.name).join(', ');
  }

  getFacultyType(faculty:any){
    switch (faculty) {
      case 1:
        return 'Government';
      case 2:
        return 'Private';
      case 3:
        return  'B.Ed Student';
      case 4:
        return 'Visiting';
      case 5:
        return 'Trainee';
      case 6:
        return 'Trainer';
      default:
        return null;    
    }
  }
}
