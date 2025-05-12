import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DatePipe } from '@angular/common';
import { Toastr } from '../../../core/services/toastr';
import { PollManagementService } from '../poll-management.service';

@Component({
  selector: 'app-poll-show-result-student',
  templateUrl: './poll-show-result-student.component.html',
  styleUrls: ['./poll-show-result-student.component.scss']
})
export class PollShowResultStudentComponent {

  public studentDetails:any = ('; '+document.cookie)?.split(`; studentDetails=`)?.pop()?.split(';')[0];
  studentId: any = null;
  URLConstants = URLConstants;
  pollData: any = [];
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
    const studentDetailsDecodedData = decodeURIComponent(this.studentDetails);
    var keyValuePairs = studentDetailsDecodedData.split('|');
    var studentidValue = "";

    for (var i = 0; i < keyValuePairs.length; i++) {
      var keyValue = keyValuePairs[i].split('=');
      if (keyValue[0] === 'studentid') {
        studentidValue = keyValue[1];
      }
    }
    this.studentId = studentidValue;
  }

  ngOnInit(): void {
    this.id = this.activatedRouteService.snapshot.params['poll_id'];

    if(this.id) {
      const formPayload = {
        student_id: this.studentId
      };
      this.pollManagementService.getPollVoteResultShow(formPayload, this.id).subscribe((res:any) => { 
        //console.log('Response poll : ', res);
        this.pollData = res?.data;
        if(this.pollData.hasOwnProperty('msg')) {
          this.toastr.showError(this.pollData.msg);
          this.router.navigate([URLConstants.STUDENT_POLL_LIST]);
        } else {
          this.title = this.pollData.poll_title;
          this.answerArray = Object.values(this.pollData.poll_answers);
          //console.log("Test length : ", this.answerArray);
        }
      });
    } else {
      //Go to poll page
      this.router.navigate([URLConstants.STUDENT_POLL_LIST]);
    }
  }

}
