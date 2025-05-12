import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { Toastr } from '../../../core/services/toastr';
import { PollManagementService } from '../poll-management.service';

@Component({
  selector: 'app-poll-show-result',
  templateUrl: './poll-show-result.component.html',
  styleUrls: ['./poll-show-result.component.scss']
})

export class PollShowResultComponent {

  public userDetails:any = ('; '+document.cookie)?.split(`; user=`)?.pop()?.split(';')[0];
  URLConstants = URLConstants;
  pollData: any = [];
  userId:any = null;
  userRole: any = [];
  id: any = null;
  title: any = "";
  answerArray: any = [];

  constructor(
    private router: Router,
    private activatedRouteService: ActivatedRoute,
    private pollManagementService: PollManagementService,
    private datePipe: DatePipe,
    private toastr: Toastr
  ) {
    const userDetailsDecodedData = decodeURIComponent(this.userDetails);
    const userDetailsJsonData = JSON.parse(userDetailsDecodedData);
    this.userId = (userDetailsJsonData) ? userDetailsJsonData?.userid : "";

    let userRollString = this.pollManagementService.getUserRoll();
    this.userRole = (userRollString ?? '').split(',');
    //console.log("test : ", this.userRole);
  }

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['poll_id'];

    if(this.id) {
      const formPayload = {
        user_id: this.userId
      };
      this.pollManagementService.getPollVoteResultShow(formPayload, this.id).subscribe((res:any) => { 
        //console.log('Response poll : ', res);        
        this.pollData = res?.data;
        if(this.userRole.includes('ROLE_ADMIN')) {          
          this.title = this.pollData.poll_title;
          this.answerArray = Object.values(this.pollData.poll_answers);
          //console.log("Testing length : ", this.answerArray);
        } else {
          if(this.pollData.hasOwnProperty('msg')) {
            this.toastr.showError(this.pollData.msg);
            this.router.navigate([this.setUrl(URLConstants.POLL_LIST)]);
          } else {
            this.title = this.pollData.poll_title;
            this.answerArray = Object.values(this.pollData.poll_answers);
            //console.log("Testing length : ", this.answerArray);
          }
        }
      });
    } else {
      //Go to poll list page
      this.router.navigate([this.setUrl(URLConstants.POLL_LIST)]);
    }
  }

  setUrl(url:string) {
    return '/'+window.localStorage.getItem("branch")+'/'+url;
  }
}
