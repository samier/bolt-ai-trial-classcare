import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup ,FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { DashboardService } from '../../dashboard.service';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { DomSanitizer } from '@angular/platform-browser';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-proxy-timetable',
  templateUrl: './proxy-timetable.component.html',
  styleUrls: ['./proxy-timetable.component.scss']
})
export class ProxyTimetableComponent implements OnInit {

  $destroy: Subject<void> = new Subject<void>();
  proxyTimeF: FormGroup = new FormGroup({})

  start: number = 0
  length: number = 10

  todayDate = this.dashboardService.getStartAndEndDate(0)

  timeTableData : any[] = []
  is_loading : boolean = false

  URLConstants = URLConstants;

  constructor(
    public dashboardService: DashboardService,
    private chd: ChangeDetectorRef,
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private toaster: Toastr,
    private sanitizer: DomSanitizer,
    public dateFormateService: DateFormatService
  ) { }

  ngOnInit(): void {
    this.initForm()
    this.getTimeTable()
  }

  onScrollChange() {
    this.start = this.start + this.length;
    this.getTimeTable()
  }

  getTimeTable( dateChange:boolean = false) {
    if(dateChange){
      this.start = 0
      this.timeTableData = []
    }

    this.is_loading = true
    const payload = {
      date   : this.proxyTimeF?.value?.date ? this.formatDate(this.proxyTimeF.value.date) : null,
      start  : this.start,
      length : this.length,
    }

    
    this.dashboardService.fetProxyTimeTableList(payload).subscribe((res: any) => {

      if(res?.data?.length > 0){
        this.timeTableData = [...this.timeTableData , ...res?.data]
        this.timeTableData = this.timeTableData.map((data: any) => ({
        ...data,
        proxy: {
          ...data.proxy,
          profile: this.sanitizer.bypassSecurityTrustUrl(data.proxy.profile)
        },
        user: {
          ...data.user,
          profile: this.sanitizer.bypassSecurityTrustUrl(data.user.profile)
        }
      }))

        this.is_loading = false
        this.chd.detectChanges()
      }else{
        this.is_loading = false
        this.chd.detectChanges()
      }

    },(error)=>{
      this.chd.detectChanges()
      this.toaster.showError( error.message || error.error.message )
      this.is_loading = false
    })
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getTime(item: any) {
    const time =
      item.substring(0, 2) <= 12
        ? item.substring(0, 5)
        : item.substring(0, 2) - 12 + item.substring(2, 5);

    const ampm = item.substring(0, 2) < 12 ? 'AM' : 'PM';

    return time + ' ' + ampm;
  }


  initForm(){
    this.proxyTimeF = this._fb.group({
      date: [new Date()]
    })
  }
}
