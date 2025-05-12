import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { CombineMarksheetService } from '../combine-marksheet.service';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-combine-marksheet-list',
  templateUrl: './combine-marksheet-list.component.html',
  styleUrls: ['./combine-marksheet-list.component.scss']
})
export class CombineMarksheetListComponent implements OnInit {
  //#region Public | Private Variables
  
  URLConstants = URLConstants;
  $destroy: Subject<void> = new Subject<void>();
  deleteId: any = null;
  isDeleteAll: boolean = false;
  isDelete: boolean = false;
  allChecked:boolean = false;
  is_list_loading: boolean = false;
  selectedMarksheetIds: Set<number> = new Set();

  markSheetList : any= []
  loadingStates: { 'student' : {[key: number]: boolean } , 'faculty' : {[key: number]: boolean } } = { student : {} , faculty : {} }
  publish_type: any = '1';
  isDownloadLoading: boolean = false;
  selectedMarksheet : any;

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public CommonService: CommonService,
    private _fb : FormBuilder,
    private _modalService: NgbModal,
    private toaster: Toastr,
    private combineMarkSheetService: CombineMarksheetService,
    private _router: Router
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getCombineMarkSheetList()
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getCombineMarkSheetList(){
    this.is_list_loading = true
    this.combineMarkSheetService.listCombineMarkSheet().subscribe((res:any)=>{
      if(res.status){
        this.markSheetList = res.data?.map((markSheet:any)=>({
          ...markSheet ,
          ['isSelected'] : false
        }))
        this.is_list_loading = false
      }
      else{
        this.toaster.showError(res.message)
        this.is_list_loading = false
      }
    },(error:any)=>{
      this.is_list_loading = false
      this.toaster.showError(error?.message ?? error?.error?.message);
    })
  }

  handleGenerate(markSheet:any=null,who:any=''){
    this.loadingStates[who][markSheet.id] = true
    const payload = {      
      combine_result_id : markSheet.id
    }
    this.combineMarkSheetService.generateCombineTeacherResult(payload,who).subscribe((res:any)=>{
      if(res.status){
        this.toaster.showSuccess(res.message)

        setTimeout(()=>{
          this.runJob(who,markSheet,res.data)
        },200)
      }
      else{
        this.toaster.showError(res.message)
        this.loadingStates[who][markSheet.id] = false
      }
    },(error:any)=>{
      this.toaster.showError(error?.message ?? error?.error?.message);
      this.loadingStates[who][markSheet.id] = false
    })
  }

  runJob(who:any,markSheet:any,id:any){

    this.combineMarkSheetService.runJob(who,id).subscribe((res:any)=>{
      if(res.status){
        if(res.data.progress < 100){
          this.runJob(who,markSheet,id)
        }else{
          this.getCombineMarkSheetList()
          this.toaster.showSuccess(res.message)
          this.loadingStates[who][markSheet.id] = false
        }
      }
    },(error:any)=>{
      this.loadingStates[who][markSheet.id] = false
      this.toaster.showError(error?.message ?? error?.error?.message);
    })
  }
  handleCombineDownload(markSheet:any ,result_for:any=null, studentWise?: boolean,schoolTemplate : boolean = false ){
    // "result_for": 0, // 0 fac 1 student
    // "type": 0   //0- batch wise , 1- class- wise, 2- student result

    let queryParams: NavigationExtras = {
      queryParams: {
        type: result_for == 0 ? ( markSheet.is_batch_wise ? 0 : 1 ) : ( studentWise ? 2 : ( markSheet.is_batch_wise ? 0 : 1 ) ) ,
        result_for: result_for,
        ...(result_for == 1 && studentWise && { publish_type : markSheet.add_publish_type }),
        ...(schoolTemplate == true && {schoolTemplate : true}),
      }
    };

    this._router.navigate([`${window.localStorage.getItem('branch')}/combine-marksheet/download-combine-result/${markSheet.id}`], queryParams)
    
  }
  
  openPublishModal(modalName:any, marksheetData?: any) {
    this.selectedMarksheet = marksheetData;
    this._modalService.open(modalName, {
      windowClass: 'duplicate-modal-section',
      backdrop: true,
      backdropClass: 'duplicate-modal-backdrop'
    });
  }

  closeModel() {
    this._modalService.dismissAll();
  }

  handleSelect(event: any, id: any) {
    if (event.target.checked) {
      this.selectedMarksheetIds.add(id);
    } else {
      this.selectedMarksheetIds.delete(id);
    }
    this.allChecked = this.selectedMarksheetIds.size == this.markSheetList?.length;
  }

  handleSelectAll(event: any) {
    const checked = event.target.checked;
    this.markSheetList.forEach((markSheet:any) => {
      markSheet.isSelected = checked;
      if (checked) {
        this.selectedMarksheetIds.add(markSheet.id);
      } else {
        this.selectedMarksheetIds.delete(markSheet.id);
      }
    });
  }

  selectionCancel() {
    this.isDeleteAll = false;
    this.markSheetList.forEach((markSheet:any) => {
      markSheet.isSelected = false
    });
    this.allChecked = false;
  }

  getMarkSheetName(id:any){
    return this.markSheetList?.find((markSheet:any)=>markSheet.id == id).mark_sheet_name || ''
  }

  deleteTemplate() {
    const payload : any = {
      combine_mark_sheet_id : []
    }
    if(this.deleteId){
      payload.combine_mark_sheet_id = [this.deleteId]
    }else{
      if(this.markSheetList?.length > 0){
        const ids : any[] = this.markSheetList?.filter((markSheet:any)=>markSheet.isSelected)?.map((markSheet: any) => markSheet.id)  || []
        if(ids?.length > 0){
          payload.combine_mark_sheet_id = ids
        }
        else{
          this.toaster.showError("Please Select the checkbox")
          return
        }
      }

    }
    this.isDelete = true;
    this.combineMarkSheetService.deleteCombineMarkSheet(payload).subscribe((res:any)=>{
      if(res.status){
        this.toaster.showSuccess(res.message)
        this.getCombineMarkSheetList()
        this.closeModel()
        this.selectedMarksheetIds.clear();
        this.selectionCancel()
        this.isDelete = false
      }
      else{
        this.toaster.showError(res.message)
        this.isDelete = false
      }
    },(error:any)=>{
      this.isDelete = false
      this.toaster.showError(error?.error?.message || error?.message )
    })

  }

  downloadStudentWiseResult(){
    const payload = {
      mark_sheet_id: this.selectedMarksheet?.id,
      publish_type: this.publish_type
    }
    this.isDownloadLoading = true;
    this.combineMarkSheetService.publishMarksheet(payload).subscribe((res: any) => {
      this.isDownloadLoading = false;
      if(res?.status){
        this.selectedMarksheet.add_publish_type = this.publish_type
        this.toaster.showSuccess(res?.message);
        this._modalService.dismissAll();
        this.handleCombineDownload(this.selectedMarksheet,1, true);
      }else{
        this.toaster.showError(res?.message)
      }
    },
    (error: any) => {
      this.isDownloadLoading = false;
      this.toaster.showError(error?.error?.message ?? error?.message ?? error?.error?.error);
    });
  }
  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  

  //#endregion Private methods
}