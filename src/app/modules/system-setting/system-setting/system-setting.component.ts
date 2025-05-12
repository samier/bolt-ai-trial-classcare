import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { SystemSettingService } from '../system-setting.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Toastr } from 'src/app/core/services/toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-system-setting',
  templateUrl: './system-setting.component.html',
  styleUrls: ['./system-setting.component.scss']
})

export class SystemSettingComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  homeworkForm: FormGroup = new FormGroup({})
  systemMainMenuList: any = []
  type: number = 1
  selectedMenu: number = 1
  selectedMenuName: string = 'General Settings'
  fieldData: any
  isFieldLoad: boolean = false
  isMainMenuList: boolean = false
  payload: any = {}
  isSaveData : boolean = false
  searchMenuText : string = ''
  searchMenuField : string = ''
  isCollape : boolean = true
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef ;
  settingId: string | null = ''
  URLConstants = URLConstants
  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _systemSettingService: SystemSettingService,
    private sanitizer: DomSanitizer,
    private _toaster: Toastr,
    private _activatedRoute : ActivatedRoute,
    private _router : Router
  ) { 
    this.settingId = this._activatedRoute.snapshot.paramMap.get('id') || null
  }

  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    if(this.settingId) {
      this.selectedMenu = Number(this.settingId)
    }
    this.initForm();
    this.getMainMenuList()
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  selectMenu(item) {
    if (this.selectedMenu !== item?.type) {
      this.selectedMenu = item?.type
      this.selectedMenuName = item?.name
      this.typeOnGetData()
    }
  }

  saveData() {
    this.isSaveData = true
    this.payload.type = this.selectedMenu
    Object.keys(this.payload).forEach(key => {
      if(typeof(this.payload[key]) == 'boolean'){
        this.payload[key] = this.payload[key] ? 1 : 0;
      }
    });
    this._systemSettingService.saveSetting(this.payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      this.isSaveData = false
      if(res.status) {
        this._toaster.showSuccess(res.message)
      } else {
        this._toaster.showError(res.message)
      }
    }, (error)=>{
      this.isSaveData = false
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  onRadioChange(radioKey: string, value: number, parentKey: string) {
    if (this.payload[parentKey]) {
      this.payload[radioKey] = value;
    }
  }

  onRadioCheckChange(radioKey: string, value: number) {
    this.payload[radioKey] = value;

    // Uncheck all child checkboxes when a radio is selected
    this.fieldData.forEach(field => {
      if (field.key === radioKey && field.child_checkbox) {
        field.child_checkbox.forEach(child => {
          this.payload[child.key] = false;
        });
      }
    });
  }

  onCheckboxChange(checkboxKey: string, event: any) {
    this.payload[checkboxKey] = event.target.checked;
  }

  async onFileChange (control,event) {
    const file = event.target.files[0]
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if(fileType !== 'audio/mpeg' && fileExtension !== 'mp3') {
      this._toaster.showError(`Can not upload ${file.type} file type. Please upload mp3 files only.`);
      event.target.value = '';
      return;
    }

    if (file) {
      const size = file.size / 1000000
      if (size >= 2) {
        this._toaster.showError('Total file size cannot exceed more than 2 MB.');
        event.target.value = '';
        return;
      }
    }

    const imagebase64 = await this.CommonService.convertToBase64(file);
    const data = {
      attachment_name: file.name,
      imagebase64: imagebase64,
    }
    this.payload[control] = data;
  }

  isStringValue(key: string): boolean {
    return this.payload && this.payload[key] && typeof this.payload[key] === 'string';
  }

  //#endregion Public methods

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
    this.homeworkForm = this._fb.group({
      name: ['']
    })
  }

  getMainMenuList() {
    this.isMainMenuList = true
    this._systemSettingService.getMainMenuData().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.isMainMenuList = false
        this.systemMainMenuList = res.data.map(element => {
          element.svg = this.sanitizeSvg(element.svg)
          return element
        });
        this.typeOnGetData()
      } else {
        this.isMainMenuList = false
        this._toaster.showError(res.message)
      }
    }, (error) => {
      this.isMainMenuList = false
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  sanitizeSvg(svgString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

  typeOnGetData() {
    const payload = {
      type: this.selectedMenu
    }
    this.isFieldLoad = true

    if (this.settingId) {
      this.selectedMenuName = this.systemMainMenuList.find((ele) => ele.type == this.settingId)?.name ?? null
    }
    if (this.selectedMenuName) {
      this._systemSettingService.getMenuFieldData(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
        if (res.status) {
          this.isFieldLoad = false
          this.fieldData = res.data

          if (this.fieldData?.length > 0 && this.selectedMenu != 8) {
            this.fieldData.forEach(field => {
              if (field.type === 'radio') {
                this.payload[field.key] = Number(field.value); // Preselect value

                if (field?.child_checkbox?.length > 0) {
                  field.child_checkbox.forEach(ele => {
                    this.payload[ele.key] = Number(ele.value) ? true : false;
                  });
                }

                if (field?.child_file?.length > 0) {
                  field.child_file.forEach(file => {
                    this.payload[file.key] = file.value;
                  });
                }

                if (field?.child_number?.length > 0) {
                  field.child_number.forEach(num => {
                    this.payload[num.key] = Number(num.value);
                  });
                }

                if (field?.child_radio?.length > 0) {
                  field.child_radio.forEach(ele => {
                    this.payload[ele.key] = Number(ele.value);
                  });
                }
              }

              else if (field.type === 'checkbox') {
                this.payload[field.key] = Number(field.value) ? true : false;

                if (field.child_radio?.length > 0) {
                  field.child_radio.forEach(ele => {
                    this.payload[ele.key] = Number(ele.value);
                  });
                }
              }
            });
          }

        } else {
          this.isFieldLoad = false
          this._toaster.showError(res.message)
        }
      }, (error) => {
        this.isFieldLoad = false
        this._toaster.showError(error?.error?.message ?? error?.message)
      })
    } else {
      this._router.navigateByUrl(this.CommonService.setUrl(URLConstants.DASHBOARD));
    }
  }

  
  onSearchIconClick(){
    this.isCollape = false;
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 0);
  }

  //#endregion Private methods
}
