import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { ResultService } from '../../result.service';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-exam-setup',
  templateUrl: './exam-setup.component.html',
  styleUrls: ['./exam-setup.component.scss']
})
export class ExamSetupComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  markSheetClassId:string | null = null;
  isExamSetup : boolean = false
  isSaveExamSetup : boolean = false
  examSetupList:any = []

  @Output() next:any = new EventEmitter<any>();
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _resultService : ResultService,
    private _activatedRoute : ActivatedRoute,
    private _toaster : Toastr
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.markSheetClassId = this._activatedRoute.snapshot.paramMap.get('id') || null;
    this.getExamSetupList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  saveExamSetup() {
    this.isSaveExamSetup = true
    const payload = {
      section_details : this.examSetupList.map(ele => {
        return {
          section_id: ele.id,
          exam_id: ele.exam_data.filter(obj => obj.is_selected).map(res => res.id)
        }
      })
    }

    this._resultService.storeMarksheetExamSetup(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.isSaveExamSetup = false
      if (res.status){
        this._toaster.showSuccess(res.message);
          this.next.emit();
      } else {
        this._toaster.showError(res.message);
      }
    },(error) => {
      this.isSaveExamSetup = false
      this._toaster.showError(error.error.message);
    });
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  getExamSetupList () {
    this.isExamSetup = true

    const payload = {
      mark_sheet_classes_id: this.markSheetClassId
    }

    this._resultService.getMarksheetExamSetup(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=> {
      this.isExamSetup = false
      if (res.status){
        this.examSetupList = res.data;
      } else {
        this._toaster.showError(res.message);
      }
    },(error) => {
      this.isExamSetup = false
      this._toaster.showError(error.error.message);
    });
  }
	
  //#endregion Private methods
}