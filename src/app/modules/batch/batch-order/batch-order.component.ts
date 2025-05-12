import { Component, OnInit } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Subject } from 'rxjs';
import { BatchService } from '../batch.service';
import { Toastr } from 'src/app/core/services/toastr';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';

@Component({
  selector: 'app-batch-order',
  templateUrl: './batch-order.component.html',
  styleUrls: ['./batch-order.component.scss']
})
export class BatchOrderComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  sortedBatch: any [] = []
  URLConstants = URLConstants
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(
    public batchService: BatchService,
    private toastr: Toastr,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.getSortedBatch();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sortedBatch, event.previousIndex, event.currentIndex);
    const updatedOrder = this.sortedBatch.map((batch: any) => {
      return {
        id: batch.id,
        batch_order: this.sortedBatch.indexOf(batch)
      }
    })
    this.batchService.updateBatchOrder({batch: updatedOrder}).subscribe((res: any) => {
      if(res?.status){
        this.toastr.showSuccess(res?.message)
      } else {
        this.toastr.showError(res?.message)
      }
    }, (error)=> {
      this.toastr.showError(error?.error?.message ?? error?.message)
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  getSortedBatch(){
    this.batchService.getSortedBatch().subscribe((res: any) => {
      if(res?.status){
        this.sortedBatch = res?.data;
      }
    })
  }
	
  //#endregion Private methods
}