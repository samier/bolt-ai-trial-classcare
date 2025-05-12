import { Component, OnInit } from '@angular/core';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CombineMarksheetService } from '../combine-marksheet.service';
import { Toastr } from 'src/app/core/services/toastr';
@Component({
  selector: 'app-generate-marksheet-setup',
  templateUrl: './generate-marksheet-setup.component.html',
  styleUrls: ['./generate-marksheet-setup.component.scss']
})
export class GenerateMarksheetSetupComponent implements OnInit {
  // --------------------------------------------------------------------------------------------------------------
  //#region Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  $destroy: Subject<void> = new Subject<void>();

  URLConstants = URLConstants;

  markSheetId: any = null

  is_list_loading: boolean = false
  markSheetList: any[] = []

  combineMarksheetList: any[] = []
  selectedCombineMarksheet: any

  loadingStates: {
    'student': { [key: number]: boolean },
    'faculty': { [key: number]: boolean }
  } = { student: {}, faculty: {} }


  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public | Private Variables
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private CombineMarksheetService: CombineMarksheetService,
    private toaster: Toastr
  ) { }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion constructor
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(params => {
      this.markSheetId = params.get('marksheetId');

      if (this.markSheetId) {
        this.getGenerateSetupList()
        this.getCombineMarksheetList()
      }
    })

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

  getGenerateSetupList() {

    this.is_list_loading = true

    this.CombineMarksheetService.fetchGenerateSetupList(this.markSheetId).subscribe((res: any) => {
      if (res.status) {
        this.markSheetList = res.data
        this.is_list_loading = false

        this.markSheetList?.forEach((row: any) => {
          if (row.faculty_is_completed == 0 && row.faculty_result_job_process == 2) {
            this.runJob('faculty', row, row.faculty_job_batch_id)
          }
          if (row.is_completed == 0 && row.result_job_process == 2) {
            this.runJob('student', row, row.job_batch_id)
          }
        }
        )
      }
      else {
        this.is_list_loading = false
        this.toaster.showError(res.message);
      }
    }, (error: any) => {
      this.is_list_loading = false
      this.toaster.showError(error.error.message || error.message)

    })
  }

  handleGenerate(markSheet: any = null, who: any = '') {

    const payload = {
      combine_result_id: this.markSheetId,
      class_id: markSheet.id
    }

    this.loadingStates[who][markSheet.id] = true

    this.CombineMarksheetService.generateCombineTeacherResult(payload, who).subscribe((res: any) => {

      if (res.status) {
        this.toaster.showSuccess(res.message)

        this.runJob(who, markSheet, res.data)
      }
      else {
        this.toaster.showError(res.message)
        this.loadingStates[who][markSheet.id] = false
      }
    }, (error: any) => {
      this.toaster.showError(error?.message ?? error?.error?.message);
      this.loadingStates[who][markSheet.id] = false
    })
  }


  onMarksheetChange(event: any) {

    this.router.navigate([this.CommonService.setUrl(URLConstants.GENERATE_MARKSHHET_SETUP), event?.id]).then(() => {

      this.markSheetId = null
      this.is_list_loading = false
      this.markSheetList = []
      this.loadingStates = { student: {}, faculty: {} }

      this.ngOnInit();
    });

  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods
  // --------------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  runJob(who: any, markSheet: any, id: any) {

    this.CombineMarksheetService.runJob(who, id).subscribe((res: any) => {

      if (res.status) {
        if (res.data.progress < 100) {
          setTimeout(() => {
            this.runJob(who, markSheet, id)
          }, 200)
        } else {
          this.toaster.showSuccess(res.message)
          setTimeout(() => {
            this.loadingStates[who][markSheet.id] = false
            this.getGenerateSetupList()
          }, 300)
        }
      }
    }, (error: any) => {
      this.loadingStates[who][markSheet.id] = false
      this.toaster.showError(error?.error?.message ?? error?.message);
    })
  }

  getCombineMarksheetList() {
    this.CombineMarksheetService.listCombineMarkSheet().subscribe((res: any) => {
      if (res?.status) {
        this.combineMarksheetList = res.data;
        this.selectedCombineMarksheet = this.combineMarksheetList.find(m => m.id == this.markSheetId).id
      }
    })
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Private methods
  // --------------------------------------------------------------------------------------------------------------
}