import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StudentService } from '../student.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-event-tab',
  templateUrl: './event-tab.component.html',
  styleUrls: ['./event-tab.component.scss']
})
export class EventTabComponent implements OnInit {

  @ViewChild('eventMdl') eventMdl: ElementRef | undefined;

  uniqueId!: any
  event: any;
  URLConstants = URLConstants;

  constructor(
    private studentService: StudentService,
    private _activatedRoute: ActivatedRoute,
    public CommonService: CommonService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this._activatedRoute.params.subscribe(params => {
      this.uniqueId = params['id'] || params['unique_id'];
    });
    this.getEventList()
  }

  getEventList() {
    const payload = {
      student_id: this.uniqueId
    }
    console.log('payload', payload);

    this.studentService.getEventList(payload).subscribe((res: any) => {
      if (res.status == true) {
        this.event = Object.values(res.data).flat();
        console.log('res', this.event);
      }
    }, (error: any) => {

    })
  }
  HandleViewEvent(eventDetail: any) {
    this.router.navigate([this.setUrl(`${URLConstants.EVENT_DETAIL}/${eventDetail.id}`)], {
      queryParams: { uniqueId: this.uniqueId }
    });
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

}
