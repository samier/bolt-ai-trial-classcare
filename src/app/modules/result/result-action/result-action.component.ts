import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { filter, pairwise, Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../common-components/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, RoutesRecognized } from '@angular/router';
import { ResultService } from '../result.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';


@Component({
  selector: 'app-result-action',
  templateUrl: './result-action.component.html',
  styleUrls: ['./result-action.component.scss']
})
export class ResultActionComponent implements OnInit {

  //#region Public | Private Variables  
  $destroy: Subject<void> = new Subject<void>();
  marksheetList : FormGroup = new FormGroup({});
  actionCount: number = 1
  markSheetId = localStorage.getItem('marksheet_id') || ''
  URLConstants = URLConstants;
  markSheetClassId: string | null = null;
  sectionSettingList:any
  className:any

  //#endregion Public | Private Variables  
  // --------------------------------------------------------------------------------------------------------------

  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private _router:Router,
      private _resultService : ResultService,
      private _activatedRoute : ActivatedRoute
  ) {}  

  //#endregion constructor  
  // --------------------------------------------------------------------------------------------------------------

  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.markSheetClassId = this._activatedRoute.snapshot.paramMap.get('id') || null;
    this.initForm();
    this.actionCount =  Number(localStorage.getItem('action_tab_ind')) || 1;
    this.getSelectedSection()
  } 

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }  

  
  //#endregion Lifecycle hooks  
  // --------------------------------------------------------------------------------------------------------------

  // #region Public methods

  goToAssignExam() {
    if (this.markSheetId) {
      const url = `${URLConstants.ASSIGN_EXAM}/${this.markSheetId}`
      this._router.navigate([this._resultService.setUrl(url)]);
      localStorage.removeItem('marksheet_id');
      localStorage.removeItem('action_tab_ind');
    }
  }

  tabChange(tab) {
    this.actionCount = tab
    localStorage.setItem('action_tab_ind',tab);
  }

  storeTabSetting(type) {
    const payload = {
      mark_sheet_classes_id:this.markSheetClassId,
      selected_section : this.sectionSettingList
    }

    payload.selected_section[type] = true;
    
    this._resultService.storeSelectedSection(payload).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if(res.status) {
        this.getSelectedSection();
      }
    })
  }

  // --------------------------------------------------------------------------------------------------------------
  //#endregion Public methods  
  // --------------------------------------------------------------------------------------------------------------
  
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initForm() {
      this.marksheetList = this._fb.group({
        name: ['']
      })
    }

  getSelectedSection() {
    this._resultService.getSelectedSection(this.markSheetClassId).pipe(takeUntil(this.$destroy)).subscribe((res:any)=>{
      if (res.status) {
        this.sectionSettingList = res.data.selected_section
        this.className = res.data.class_name
      } else {

      }
    })
  }

  //#endregion Private methods

}

