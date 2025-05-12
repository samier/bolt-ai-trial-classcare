import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { TeacherAchivementService } from '../teacher-achivement.service';
import { Toastr } from 'src/app/core/services/toastr';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { CommonService } from 'src/app/core/services/common.service';
import { DateFormatService } from 'src/app/service/date-format.service';

@Component({
  selector: 'app-teacher-achivement',
  templateUrl: './teacher-achivement.component.html',
  styleUrls: ['./teacher-achivement.component.scss']
})
export class TeacherAchivementComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  achivementForm: FormGroup = new FormGroup({});
  achivementFilterForm: FormGroup = new FormGroup({});
  dtOptionsForAchivement: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  achivementData: any = []
  facultyList: any = []
  isAchivement: boolean = false
  selectedId: string | number | null = null
  isSaveAchivement: boolean = false

  
  isOpenByClick: boolean = true
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    private _teacherAchivementService: TeacherAchivementService,
    private _toaster: Toastr,
    private _formValidationService: FormValidationService,
    public  dateFormateService : DateFormatService
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.isAchivement = true;
    this.defineDtoptionForAchivement();
    this.getFaculty();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  openPublishModal(modalName) {
    this._modalService.open(modalName, {
      size: 'lg',
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
    });
  }

  closeModel() {
    this._modalService.dismissAll();
    this.achivementForm.reset();
    this.selectedId = null
  }

  saveAchivement() {
    if (this.achivementForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.achivementForm);
      return;
    }

    const formData: any = new FormData();
    for (const key in this.achivementForm.value) {
      if (this.achivementForm.value.hasOwnProperty(key)) {
        formData.append(key, this.achivementForm.value[key] == null ? '' : this.achivementForm.value[key]);
      }
    }
    this.isSaveAchivement = true
    if (this.selectedId) {
      this._teacherAchivementService.updateAchivement(formData, this.selectedId).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        this.isSaveAchivement = false
        if (res.status) {
          this._toaster.showSuccess(res.message);
          this.closeModel()
          this.reloadData()
        } else {
          this._toaster.showError(res.message);
        }
      }, (error) => {
        this.isSaveAchivement = false
        this._toaster.showError(error?.error?.error ?? error?.message);
      })
    } else {
      this._teacherAchivementService.createAchivement(formData).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        this.isSaveAchivement = false
        if (res.status) {
          this._toaster.showSuccess(res.message);
          this.closeModel()
          this.reloadData()
        } else {
          this._toaster.showError(res.message);
        }
      }, (error) => {
        this.isSaveAchivement = false
        this._toaster.showError(error?.error?.error ?? error?.message);
      })
    }

  }

  clearFilterData() {
    this.achivementFilterForm.reset();
    this.reloadData();
  }

  getData() {
    this.reloadData()
  }

  editAchivement(item, model) {

    this.selectedId = item.id

    if (item) {
      this.achivementForm.patchValue({
        teacher_id: item.teacher_id,
        achievement_name: item.achievement_name,
        remark: item.remark,
        achievement_date: item.date,
      })

      this.openPublishModal(model);
    }

  }

  deleteAchivement(id) {
    const confirm = window.confirm('Are you sure you want to delete achivement ?');
    if (confirm) {
      this._teacherAchivementService.deleteAchivement(id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this._toaster.showSuccess(res.message);
          this.reloadData();
        } else {
          this._toaster.showError(res.message);
        }
      }, (error) => {
        this._toaster.showError(error?.error?.error ?? error?.message);
      })
    }
  }

  changeAttechment(event) {
    const file = event.target.files[0];
    this.achivementForm['controls']['achievement_image'].patchValue(file)

    // if (file) {
    //   const reader = new FileReader();

    //   reader.onload = () => {
    //     const base64URL = reader.result?.toString().split(',')[1] as string;
    //     const fileObj = {
    //       fileName: file.name,
    //       imagebase64: base64URL
    //     }
    //     this.achivementForm['controls']['achievement_image'].patchValue(fileObj)
    //   };

    //   reader.readAsDataURL(file);
    // }
  }

  downloadAchivement(url) {
    window.open(url, '_blank')
  }


  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.achivementForm = this._fb.group({
      teacher_id: [null,[Validators.required]],
      achievement_name: [''],
      remark: [''],
      achievement_image: [''],
      achievement_date: [''],
      file: [''],
    });

    this.achivementFilterForm = this._fb.group({
      teacher_id: [null],
      date: [null],
    })
  }

  defineDtoptionForAchivement() {
    this.dtOptionsForAchivement = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadDataForAchivement(dataTablesParameters, callback);
      },
      columns: [
        { title: 'Teacher', data: 'teacher_full_name' },
        { title: 'Achievement', data: 'achievement_name' },
        { title: 'Date', data: 'date', searchable: false, orderable: false },
        { title: 'Remark', data: 'remark' },
        { title: 'Action', data: 'id',className:'action-btn-sticky', searchable: false, orderable: false },
      ],
      // language: {
      //   info: '',
      //   zeroRecords: 'No records found!'
      // }
    };
  }

  loadDataForAchivement(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters,
      ...this.achivementFilterForm.value
    };
    this._teacherAchivementService.getAchivement(dataTablesParameters).subscribe(
      (resp: any) => {
        this.isAchivement = false
        this.achivementData = resp?.data?.original?.data;
        callback({
          recordsTotal: resp?.data?.original?.recordsTotal,
          recordsFiltered: resp?.data?.original?.recordsFiltered,
          data: [],
        });
      }, (error) => {
        this._toaster.showError(error?.error?.error ?? error?.message);
      }
    );
  }

  getFaculty() {
    const payload = {
      role: 'ROLE_FACULTY'
    }

    this._teacherAchivementService.getFaculty(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.facultyList = res.data.map((ele) => {
          return {
            name: ele.full_name,
            id: ele.id
          }
        })
      } else {
        this._toaster.showError(res.message);
      }
    }, (error) => {
      this._toaster.showError(error?.error?.error ?? error?.message);
    })
  }

  /**
   * @ngdoc method
   * @name reloadData
   * @description
   * reload data-table
   */
  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }


  //#endregion Private methods
}
