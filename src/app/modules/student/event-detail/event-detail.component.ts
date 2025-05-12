import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../event/event.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;
  id: any
  uniqueId: any
  eventDetail: any
  selectedIndex: any

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private eventService: EventService,
    public dateFormateService: DateFormatService,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.route.queryParams.subscribe(params => {
      this.uniqueId = params['uniqueId'];
    });

    this.getEvent();
  }

  getEvent() {
    this.eventService.getEvent(this.id).subscribe(
      (resp: any) => {
        this.eventDetail = resp?.data;
      }
    );
  }

  viewImage(index: any, eventMdl) {
    this.selectedIndex = index;
    this.modalService.open(eventMdl, {
      windowClass: 'event_detail_modal',
    });
  }

  close() {
    this.modalService.dismissAll()
    this.clearForm()
  }

  clearForm() {

  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

  selectImageFromThumbnail(index: number) {
    this.selectedIndex = index;
  }

  prevImage() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      this.selectedIndex = this.eventDetail?.event_files.length - 1;
    }
  }

  nextImage() {
    if (this.selectedIndex < this.eventDetail?.event_files.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;
    }
  }
}
