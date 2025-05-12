import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { TransportService } from '../../transport-management/transport.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { ExamServiceService } from '../exam-service.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-blank-exam-sheet',
  templateUrl: './blank-exam-sheet.component.html',
  styleUrls: ['./blank-exam-sheet.component.scss']
})
export class BlankExamSheetComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  blankSheetForm : FormGroup = new FormGroup({})
  sectionList: any = []
  classList: any = []
  batchList: any = []
  isGetReport : boolean = false
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private _transportService : TransportService,
      private _formValidationService : FormValidationService,
      private _examService : ExamServiceService,
      private _toastr : Toastr,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getSectionList();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  clearData() {
    this.blankSheetForm.reset();
  }

  getReport() {
    if (this.blankSheetForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.blankSheetForm);
      return;
    }

    this.isGetReport = true

    const payload = {
      section_id: this.blankSheetForm.value.section_id,
      class_id: [this.blankSheetForm.value.class_id],
      batch_id: this.blankSheetForm.value.batch_id.length > 0 ? this.blankSheetForm.value.batch_id.map(ele => ele.id) : [],
      title: this.blankSheetForm.value.title,
      row : this.blankSheetForm.value.row,
    }

    this._examService.getBlankExamSheet(payload).pipe(takeUntil(this.$destroy)).subscribe((res) => {
      this.downloadFile(res, 'blank-exam-sheet', 'pdf');
      this.isGetReport = false
    },async(error)=> {
      this.isGetReport = false
      if(error?.error?.type == 'application/json') {
        const data = JSON.parse(await error?.error.text());
        if(!data.status){
          this._toastr.showError(data?.message);
        }
      }
    })

  }

  getClasses() {
    this.blankSheetForm.controls['class_id'].reset();
    this.blankSheetForm.controls['batch_id'].reset();
    this.classList = []
    this.batchList = []

    const section = this.blankSheetForm.value ? this.blankSheetForm.value.section_id : ''
    this._transportService.getClassList(section).pipe(takeUntil(this.$destroy))?.subscribe((res: any) => {
      if (res.status) {
        this.classList = res.data
      } else {
        this._toastr.showError(res?.message)
      }
    })
  }

  getBatches() {
    this.batchList = []
    this.blankSheetForm.controls['batch_id'].reset();
    const classes = this.blankSheetForm.value ? this.blankSheetForm.value.class_id : ''
    if (classes) {
      const payload = {
        classes: [classes]
      }
      this._transportService.getBatchesList(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.batchList = res.data
        } else {
          this._toastr.showError(res?.message)
        }
      });
    }
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
    initForm() {
      this.blankSheetForm = this._fb.group({
        section_id: [null,[Validators.required]],
        class_id: [null,[Validators.required]], //[Validators.required]
        batch_id: [ null,[Validators.required]], //[Validators.required]
        title:[null],
        row:[6,[Validators.required,Validators.min(1),Validators.max(15)]],
      })

      this.blankSheetForm.valueChanges.pipe(takeUntil(this.$destroy)).subscribe((res) => {
        this.blankSheetForm.controls['batch_id'].markAsPristine();
        this.blankSheetForm.controls['batch_id'].markAsUntouched();
      })
    }
    
    getSectionList() {
      this._transportService.getSectionList("").pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.sectionList = res.data
          this.getClasses();
        }
      })
    }

    downloadFile(res: any, file: any, format: any) {

      let fileName = file;
      let blob: Blob = res.body as Blob;
      let pdfSrc = window.URL.createObjectURL(blob);
      if (format == 'pdf') {
        let iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfSrc;
        document.body.appendChild(iframe);
        setTimeout(() => {
          iframe.contentWindow?.print();
        }, 200);
        //iframe.contentWindow?.print();
      } else {
        let a = document.createElement('a');
        a.download = fileName;
        a.href = pdfSrc;
        a.click();
      }
    }
	
  //#endregion Private methods
}