import { Component, OnInit } from '@angular/core';
import { enviroment } from 'src/environments/environment.staging';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Route } from '@angular/router';
import { ComplainService } from '../complain.service';
import { Toastr } from 'src/app/core/services/toastr';
import { DateFormatService } from 'src/app/service/date-format.service';
@Component({
  selector: 'app-complain-view',
  templateUrl: './complain-view.component.html',
  styleUrls: ['./complain-view.component.scss']
})
export class ComplainViewComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();
  URLConstants: any = URLConstants;
  id: any

  statuses: any = [
    { id: 1, name: 'Open' },
    { id: 2, name: 'In Progress' },
    { id: 3, name: 'Close' },
    { id: 4, name: 'Reopen' },
  ];
  
  status: any = 1
  draw: any = 1
  length: any = 3

  complainDetails: any = []

  fileIcons: any = {
    "pdf": './assets/img/files/file.png',
    "png": './assets/img/files/image.png',
    "jpg": './assets/img/files/image.png',
    "jpeg": './assets/img/files/image.png',
    "gif": './assets/img/files/image.png',
    "webp": './assets/img/files/image.png',
  };
  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private route: ActivatedRoute,
    public ComplainService: ComplainService,
    private toaster: Toastr,
    public DateFormatService: DateFormatService
  ) {
    this.id = this.route.snapshot.paramMap.get('id');
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.getComplainDetails()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  // Status Change
  onStatusChange(itemId: number, event: Event) {
    const selectedValue = Number((event.target as HTMLSelectElement).value);
    const payload = {
      status: selectedValue
    }
    this.ComplainService.updateStatus(itemId, payload).subscribe((res: any) => {
      if (res.status) {
        this.toaster.showSuccess(res.message);
      }
      else {
        this.toaster.showError(res.message)
      }
    }, (error: any) => {
      this.toaster.showError(error.error.message || error.message)
    })
  }

  download(url: string) {
    window.open(url, '_blank')
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  getComplainDetails() {
    // this.ComplainService.complainList(payload).subscribe((res: any) => {
    this.ComplainService.fetchComplainDetail(this.id).subscribe((res: any) => {
      // this.complainDetails = res.data.find((res:any) => res.id == this.id)
      this.complainDetails = res.data
      this.complainDetails.attachments = this.CommonService.validateAndFixUrls(this.complainDetails.attachments, 'attachment_url')
    }, (error: any) => {

    })
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}
