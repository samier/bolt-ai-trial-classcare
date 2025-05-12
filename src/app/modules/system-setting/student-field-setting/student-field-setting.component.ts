import { Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { SystemSettingService } from '../system-setting.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CdkDrag, Point, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-student-field-setting',
  templateUrl: './student-field-setting.component.html',
  styleUrls: ['./student-field-setting.component.scss']
})
export class StudentFieldSettingComponent implements OnInit {
  //#region Public | Private Variables
  @ViewChildren(CdkDrag) cdkDrags!: QueryList<CdkDrag>;
  $destroy: Subject<void> = new Subject<void>();
  isLoader: boolean = false
  isSave: boolean = false
  studentField: any = []
  URLConstants = URLConstants
  @Input() isSettingLoad
  
  sortableOptions = {
    animation: 150,
    direction: 'auto', // allows auto-adjustment for mixed orientation
    // ghostClass: 'sortable-ghost',
    swapThreshold: 0.65,
    filter: '.filtered', 
    onUpdate : () => this.setFieldOrder(),
  };

  allCustomFields:any = [];

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb: FormBuilder,
    private _systemSettingService: SystemSettingService,
    private _toaster: Toastr
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getFieldOfStudent();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  saveField() {
    let formattedResponse:any = [];
    this.studentField.forEach((element:any) => {
      element.items.forEach((item:any) => {
        formattedResponse[item.key] = {
          is_visible: item.is_visible ? 1 : 0,
          required: item.is_visible ? (item.required ? 1 : 0) : 0,
          order: item.order,
          key: element.key,
          is_custom: item?.is_custom ? true : false
        };
      })
    });

    this.isSave = true
    this._systemSettingService.updateStudentField(formattedResponse).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isSave = false
      if (res.status) {
        this._toaster.showSuccess(res.message);
        this.getFieldOfStudent()
      } else {
        this.isSave = false
        this._toaster.showError(res.message)
      }
    }, (error) => {
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  formatName(value:any){
    return value.replaceAll('_', ' ');
  }

  handleVisibilityChange(i, j){
    this.studentField[i].items[j].order = this.studentField[i].items.length
  }
  
  addCustomField(field:any, index:any){
    let group = this.studentField[index];
    let data = {
      label:field.field_title,
      key:field.field_name,
      group_name: group.key,
      is_system_required: 0,
      required: field.required,
      is_visible: 1,
      order: group.items.length - 1,
      is_custom: 1,
    }
    field.is_assigned = true;
    group.items.push(data);
  }

  removeCustomField(item:any, index:any){
    this.allCustomFields.find((x:any) => x.field_name == item.key).is_assigned = false
    this.studentField[index].items = this.studentField[index].items.filter((el:any) => el.key != item.key); 
  }

  setFieldOrder(){
    this.studentField = this.studentField.map((field: any, index: number) => {
        return {...field, items: field.items.map((item:any, i:number) => {
          return {...item, order:i }
        })}
        
    });
  }
  
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  getFieldOfStudent() {
    this.isLoader = true
    this._systemSettingService.getStudentField().pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      this.isLoader = false
      if (res.status) {
        this.studentField = res.data.fields
        this.allCustomFields = res.data.custom_fields ?? []
      } else {
        this._toaster.showError(res.message)
      }
    }, (error) => {
      this.isLoader = false
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }
  

   //#endregion Private methods
}

