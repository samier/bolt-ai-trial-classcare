import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-video-link',
  templateUrl: './video-link.component.html',
  styleUrls: ['./video-link.component.scss']
})
export class TodayLeaveComponent implements OnInit {

  branch_id: any = window.localStorage.getItem('branch');
  user_id: any = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  private API_URL = enviroment.apiUrl;
  symfonyHost = enviroment.symfonyHost;
  URLConstants = URLConstants;

  male_professor: any = 'http://' + enviroment?.symfonyDomain + '/public/upload/facultyImage/professor-male.png'
  female_professor: any = 'http://' + enviroment?.symfonyDomain + '/public/upload/facultyImage/professor-female.png'

  videoLinkList: any = []
  is_loading: boolean = true
  currentPage: number = 1

  constructor(
    public dashBoardService: DashboardService,
    private chd: ChangeDetectorRef,

  ) { }

  ngOnInit(): void {
    this.videoList()
    this.currentPage = 1
  }

  videoList() {
    this.is_loading = false
    const payLoad = {
      branchId: this.branch_id,
      academicYear: this.currentYear_id,
      isDraft: "0",
      attachmentType: "videolink",
      page : this.currentPage
    }

    this.dashBoardService.getHomeWork(payLoad).subscribe((res: any) => {
      const data = Object.keys(res?.data?.data)?.map((dt: string) => ({ date: dt, data: res?.data?.data[dt] }))?.flatMap((d: any) => d?.data);
      this.videoLinkList = [ ...this.videoLinkList , ...data]
      // this.homework = this.formatSubmissionDate(this.homework);
      this.chd.detectChanges()
      this.is_loading = false

    });
  }

  onScrollChange(){
    this.currentPage++;
    this.videoList();
  }
  openLinkInNewTab(url: string) {
    window.open(url, '_blank')
  }

  setUrl(url: string) {
    return '/' + window.localStorage.getItem("branch") + '/' + url;
  }

}
