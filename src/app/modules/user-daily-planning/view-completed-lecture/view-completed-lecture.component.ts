import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { UserDailyPlanningService } from '../user-daily-planning.service';
import { Toastr } from 'src/app/core/services/toastr';
import { ClassCareValidatores } from 'src/app/shared/common-input-component/form-validators';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';

@Component({
  selector: 'app-view-completed-lecture',
  templateUrl: './view-completed-lecture.component.html',
  styleUrls: ['./view-completed-lecture.component.scss']
})
export class ViewCompletedLectureComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  completedLectureForm : FormGroup = new FormGroup({});
  academicYear: any = window.localStorage.getItem('acedemicYear');
  minDate: any;
  maxDate: any;
  lectureId: any;
  lectureData: any = [];
  isSaveLoading: boolean = false;
  uploadedFiles: any;
  @ViewChild('file') fileSelect!: ElementRef;
  hasEdit : boolean = this.CommonService.hasPermission('faculty_lecture_plan', 'has_edit')
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private userDailyPlanningService: UserDailyPlanningService,
    private _fb : FormBuilder,
    private modalRef: NgbActiveModal,
    private toastr: Toastr,
    private formvalidationService : FormValidationService
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getLectureById();
    this.academicYear = JSON.parse(this.academicYear ?? '');
    this.minDate = this.academicYear?.start_time;
    this.maxDate = this.academicYear?.end_time;
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  async saveCompletedLecture(){
    if(this.completedLectureForm?.invalid) {
      this.formvalidationService.getFormTouchedAndValidation(this.completedLectureForm)
      return this.toastr.showError("Please fill all the required fields");
    }
    const payload : any = {
      ...this.completedLectureForm?.value,
      id: this.lectureId,
      attachments: []
    }
    const file = this.completedLectureForm?.value?.upload;
    if (file) {
      for (let index = 0; index < file?.length; index++) {
        const element = file[index];
        const imagebase64 = await this.CommonService.convertToBase64(element);
        const data = {
          fileName    : element?.name,
          imagebase64 : imagebase64,
        }
        payload?.attachments?.push(data);
      }
    }
    this.isSaveLoading = true;
    this.userDailyPlanningService.saveCompletedLecture(payload).subscribe((res: any) => {
      this.isSaveLoading = false;
      if(res?.status){
        this.toastr.showSuccess(res?.message);
        this.closeModal();
      }else{
        this.toastr.showError(res?.message);
      }
    },
    (error: any) => {
      this.isSaveLoading = false;
      this.toastr.showError(error?.message ?? error?.error?.message ?? error?.errors?.message);
    });
  }

  download(url: string) {
    window.open(url, '_blank')
  }

  closeModal(){
    this.modalRef.close({
      data: true
    })
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.completedLectureForm = this._fb.group({
      remark: [null],
      remark_date: [null, [Validators.required]],
      upload: [null],
      reference_link: [null, [ClassCareValidatores.pattern(/^(https?:\/\/)?([\w\-]+\.)+[\w]{2,}(\/\S*)?$/, "Please enter valid link")]]
    })
  }

  getLectureById(){
    this.userDailyPlanningService.getLectureById(this.lectureId).subscribe((res: any) => {
      if(res?.status){
        this.lectureData = res?.data;
        this.uploadedFiles = this.lectureData?.attachments
      }else{
        this.toastr.showError(res?.message);
        this.closeModal();
      }
    },
    (error: any) => {
      this.toastr.showError(error?.message ?? error?.error?.messge ?? error?.errors?.message ?? 'Something Went Wrong!' );
      this.closeModal();
    });
  }
  //#endregion Private methods
}
