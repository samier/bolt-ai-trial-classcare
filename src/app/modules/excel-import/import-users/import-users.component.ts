import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { FileimportService } from '../fileimport.service';
import { Toastr } from 'src/app/core/services/toastr';
import { UserService } from '../../user/user.service';
import { userType } from 'src/app/common-config/static-value';

@Component({
  selector: 'app-import-users',
  templateUrl: './import-users.component.html',
  styleUrls: ['./import-users.component.scss'],
})
export class ImportUsersComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  importUserForm: FormGroup = new FormGroup({});
  URLConstants = URLConstants;
  isDownloadLoading: boolean = false;
  importLoading: boolean = false;
  userTypeList: any[] = userType;
  userRoleList: any[] = [];
  selectedFile: any = null;
  return_result: boolean = false;
  failed_rows: any[] = [];

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(
    public CommonService: CommonService,
    private _fb: FormBuilder,
    private fileImportService: FileimportService,
    private userService: UserService,
    private toastr: Toastr
  ) {}

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initForm();
    this.getUserRoleList();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  downloadSampleFile() {
    this.isDownloadLoading = true;
    this.fileImportService.getUserExcelSample().subscribe(
      (res: any) => {
        this.isDownloadLoading = false;
        this.toastr.showSuccess(res?.message);
        this.CommonService.downloadFile(res, 'users-sample-file', 'excel');
      },
      async (error: any) => {
        this.isDownloadLoading = false;
        if (error?.error?.type == 'application/json') {
          const data = JSON.parse(await error?.error.text());
          if (!data.status) {
            this.toastr.showError(data?.message);
          }
        }
      }
    );
  }

  fileChange(event: any) {
    if (event) {
      this.selectedFile = event.target.files[0];
    }
  }

  importExcel() {
    this.importUserForm.markAllAsTouched();
    if (this.importUserForm.invalid) {
      this.toastr.showError('Please Fill All Required Field');
      return;
    }
    const formData = new FormData();
    {
      formData.append('user_type', this.importUserForm?.value?.user_type);
      formData.append('user_role', this.importUserForm?.value?.user_role);
      formData.append('file', this.selectedFile);
    }
    this.importLoading = true;
    this.fileImportService.importUsersExcel(formData).subscribe(
      (res: any) => {
        this.importLoading = false;
        if (res.status) {
          this.return_result = true;
          this.toastr.showSuccess(res?.message);
          this.failed_rows = res.data;
        } else {
          this.toastr.showError(res.message ?? res.error);
        }
        this.importUserForm.reset();
      },
      (error: any) => {
        this.importLoading = false;
        this.toastr.showError(
          error?.message ?? error?.error ?? error?.error?.message
        );
      }
    );
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.importUserForm = this._fb.group({
      user_type: [null, [Validators.required]],
      user_role: [null, [Validators.required]],
      file: [null, [Validators.required]],
    });
  }

  getUserRoleList() {
    this.userService
      .getRoleList()
      .pipe(takeUntil(this.$destroy))
      .subscribe((res: any) => {
        if (res?.status) {
          this.userRoleList = res?.data;
        }
      });
  }

  

  //#endregion Private methods
}
