import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { FormValidationService } from 'src/app/shared/common-input-component/form-validation.service';
import { UploadDocumentService } from '../upload-document.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-upload-document',
  templateUrl: './upload-document.component.html',
  styleUrls: ['./upload-document.component.scss']
})
export class UploadDocumentComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  uploadImageForm: FormGroup = new FormGroup({})
  dtOptionsForUploadImage: DataTables.Settings = {};
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective | null = null;
  uploadImageData: any = []
  isUploadImage: boolean = false
  isUpload: boolean = false

  isOpenByClick: boolean = true

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _modalService: NgbModal,
    private _formValidationService: FormValidationService,
    private _uploadDocumentService: UploadDocumentService,
    public toaster: Toastr
  ) { }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.isUploadImage = true
    this.defineDtoptionForUploadImage()
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
    this._modalService.open(modalName);
  }

  closeModel() {
    this._modalService.dismissAll();
    this.uploadImageForm.reset()
  }

  uploadImage() {

    if (this.uploadImageForm.invalid) {
      this._formValidationService.getFormTouchedAndValidation(this.uploadImageForm);
      return;
    }

    const payload = {
      name: this.uploadImageForm.value.name,
      file: this.uploadImageForm.value.fileObj
    }

    this.isUpload = true
    this._uploadDocumentService.storeDocument(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isUpload = false
      if (res.status) {
        this.toaster.showSuccess(res.message);
        this.closeModel();
        this.reloadData();
      } else {
      this.toaster.showError(res.message);
      }
    }, (error) => {
      this.toaster.showError(error?.error?.message ?? error?.message);
      this.isUpload = false
    })

  }

  changeAttechment(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64URL = reader.result?.toString().split(',')[1] as string;
        const fileObj = {
          fileName: file.name,
          imagebase64: base64URL
        }
        this.uploadImageForm['controls']['fileObj'].patchValue(fileObj)
      };

      reader.readAsDataURL(file);
    }
  }

  deleteImage(id) {
    const confirm = window.confirm('Are you sure you want to delete image ?')

    if (confirm) {
      this._uploadDocumentService.deleteDocument(id).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.toaster.showSuccess(res.message);
          this.reloadData();
        }
      }, (error) => {
        this.toaster.showSuccess(error?.error?.message ?? error?.message);
      })
    }
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.uploadImageForm = this._fb.group({
      name: ['', [Validators.required]],
      file: [null, [Validators.required]],
      fileObj: [null]
    })
  }

  defineDtoptionForUploadImage() {
    this.dtOptionsForUploadImage = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu: [50, 100, 200],
      serverSide: true,
      processing: true,
      searching: true,
      // scrollX: true,
      scrollCollapse: true,
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadDataForImageUpload(dataTablesParameters, callback);
      },
      columns: [
        { title: 'Name', data: 'name' },
        { title: 'Image', data: 'image', searchable: false, orderable: false },
        { title: 'Action', data: 'id', searchable: false, orderable: false },
      ],
    };
  }

  loadDataForImageUpload(dataTablesParameters?: any, callback?: any) {
    dataTablesParameters = {
      ...dataTablesParameters
    };
    this._uploadDocumentService.documentList(dataTablesParameters).subscribe(
      (resp: any) => {
        this.isUploadImage = false
        this.uploadImageData = resp?.data?.original?.data;
        callback({
          recordsTotal: resp?.data?.original?.recordsTotal,
          recordsFiltered: resp?.data?.original?.recordsFiltered,
          data: [],
        });
      }, (error) => {
        this.isUploadImage = false
      }
    );
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  //#endregion Private methods
}