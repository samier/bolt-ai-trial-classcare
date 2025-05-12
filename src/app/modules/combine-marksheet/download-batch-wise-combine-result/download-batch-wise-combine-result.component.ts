import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { CombineMarksheetService } from '../combine-marksheet.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-download-batch-wise-combine-result',
  templateUrl: './download-batch-wise-combine-result.component.html',
  styleUrls: ['./download-batch-wise-combine-result.component.scss']
})
export class DownloadBatchWiseCombineResultComponent implements OnInit {

 //#region Public | Private Variables
  
 $destroy: Subject<void> = new Subject<void>();
 downloadResult: FormGroup = new FormGroup({})
 isLoading: boolean = false;
 results: any = [
   {
     id: 1,
     class_name: 'Test Class 1'
   },
   {
     id: 2,
     class_name: 'Test Class 2'
   },
   {
     id: 3,
     class_name: 'Test Class 3'
   }
 ]
 batchList: any = []
 //#endregion Public | Private Variables
 
 // --------------------------------------------------------------------------------------------------------------
 // #region constructor
 // --------------------------------------------------------------------------------------------------------------
 
 constructor(public CommonService: CommonService,
   private toastr: Toastr,
   private combineMarksheetService: CombineMarksheetService,
   private _fb: FormBuilder
 ) {}
 
 //#endregion constructor
 
 // --------------------------------------------------------------------------------------------------------------
 // #region Lifecycle hooks
 // --------------------------------------------------------------------------------------------------------------
 
 ngOnInit(): void {
   this.downloadResult = this._fb.group({
     batch_id: [null]
   })
 }
 
 ngOnDestroy(): void {
   this.$destroy.next();
   this.$destroy.complete();
 }
 
 //#endregion Lifecycle hooks
 
 // --------------------------------------------------------------------------------------------------------------
 // #region Public methods
 // --------------------------------------------------------------------------------------------------------------
 
 //#endregion Public methods
 
 // --------------------------------------------------------------------------------------------------------------
 // #region Private methods
 // --------------------------------------------------------------------------------------------------------------

 getCombineResults(){

 }

 //#endregion Private methods
}