import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { IncomeExpenseService } from '../income-expense.service';
import { Toastr } from 'src/app/core/services/toastr';

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.scss']
})
export class ProfitLossComponent implements OnInit {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  profitLossF : FormGroup = new FormGroup({})
  profitData:any = [];
  lossData:any = [];
  isLoading:boolean = false;
  isShowing:boolean = false;
  isPdfDownload:boolean = false;
  isExcelDownload:boolean = false;
  profit = 0
  loss = 0
  
  
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
      private _fb : FormBuilder,
      private incomeExpenseService: IncomeExpenseService,
      private toastr: Toastr,      
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
    this.getProfitLossReport();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  download(type:any){
    if(type == 'pdf'){
      this.isPdfDownload = true
    }
    if(type == 'excel'){
      this.isExcelDownload = true
    }

    this.incomeExpenseService.getProfitLossReportDownload(this.profitLossF.value, type).subscribe((resp:any) => {
      this.CommonService.downloadFile(resp, 'profit-loss-report'+new Date().toISOString(), type);
      this.isPdfDownload = false
      this.isExcelDownload = false
    },(error:any) => {
      if(error.status == 404){
        this.toastr.showError('No data Found!')
      }else{
        this.toastr.showError('Something went wrong!')
      }
      this.isPdfDownload = false
      this.isExcelDownload = false
    })
  }

  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  getProfitLossReport(){
    this.isLoading = true
    this.incomeExpenseService.getProfitLossReport(this.profitLossF.value).subscribe((resp:any) => {
      if(resp.status){
        this.profitData = resp.data['Income'] ?? null;
        this.lossData = resp.data['Expense'] ?? null;

        
        const incomeTotal = parseFloat(this.profitData?.total_amount || '0');
        const expenseTotal = parseFloat(this.lossData?.total_amount || '0');
        this.profit = Math.max(0, incomeTotal - expenseTotal);
        this.loss = Math.max(0, expenseTotal - incomeTotal);
      }
      this.isLoading = false
      this.isShowing = false;

    }, (error:any) => {
      this.isLoading = false
      this.isShowing = false;
      console.log(error);
    })
  }

  show(){
    this.isShowing = true;
    this.getProfitLossReport()
  }

  clear(){
    this.profitLossF.reset();
    this.show();
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.profitLossF = this._fb.group({
      date: [null]
    })
  }
	
  //#endregion Private methods
}
