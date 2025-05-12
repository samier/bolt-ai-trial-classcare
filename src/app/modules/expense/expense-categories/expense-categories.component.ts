import { Component, Input, OnInit, ViewChild , ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { URLConstants } from 'src/app/shared/constants/routerLink-constants';
import { ExpenseService } from '../expense.service';
import { ActivatedRoute } from '@angular/router';
import { Toastr } from 'src/app/core/services/toastr';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-expense-categories',
  templateUrl: './expense-categories.component.html',
  styleUrls: ['./expense-categories.component.scss']
})
export class ExpenseCategoriesComponent implements OnInit {
  //#region Public | Private Variables

  $destroy: Subject<void> = new Subject<void>();
  URLConstants = URLConstants;
  dtOptions: DataTables.Settings = {};
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective | null = null;
  dtRender : boolean = false;
  tbody: any;
  search:any = {
    categoryName: '',
    amount: '',
  };
  @Input() categoriesFilterForm!: FormGroup;
  isResetloading : boolean = false;

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions!: Highcharts.Options;
  chartConstructor: string = 'chart';
  chartCallback: Highcharts.ChartCallbackFunction = function () {};
  updateFlag: boolean = false;
  oneToOneFlag: boolean = true;
  runOutsideAngular: boolean = false;
  configArray: any = [];

  schoolList : any = []
  schoolName : any = ''

  branch_id: any = window.localStorage.getItem('branch');
  user_id :any   = window.localStorage.getItem('user_id');
  currentYear_id: any = Number(
    ('; ' + document.cookie)?.split(`; academic_year_id=`)?.pop()?.split(';')[0]
  );

  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    public commonService: CommonService,
    private _fb : FormBuilder,
    private expenseService: ExpenseService,
    public activatedRouteService: ActivatedRoute,
    private toaster:Toastr,
    public datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
  ) {}
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.currentSchool()
    this.initForm();
    this.initDatatable();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------
  
  clearAll(){
    this.isResetloading = true
    this.categoriesFilterForm.reset();
    this.reloadData();
  }

  reloadData() {
    this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  //#endregion Public methods
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  
  initForm() {
    this.categoriesFilterForm = this._fb.group({
      date: [''],
    })
    this.categoriesFilterForm?.get('date')?.valueChanges?.pipe(distinctUntilChanged(),takeUntil(this.$destroy))?.subscribe((res:any)=>{
      if (!this.isResetloading) {
        this.reloadData();
      }
    })
  }

  initDatatable(){
    const that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 50,
      lengthMenu : [50,100,200],
      serverSide: true,
      processing: true,
      searching: true,
      stateSave: true,
      order: [[1,'desc']],
      stateSaveCallback: function(settings,data) {
        Object.assign(data,{
          date: {
            start_date: that.formatDate(that.categoriesFilterForm?.value?.date?.startDate),
            end_date: that.formatDate(that.categoriesFilterForm?.value?.date?.endDate)
          }
        })
        localStorage.setItem('DataTables_Expense/Categories', JSON.stringify(data))
      },
      stateLoadCallback: function(settings) {
        const isModuleActive =  that.CommonService.isModuleActive(that.activatedRouteService.snapshot.data);
        if(isModuleActive) {
          let state:any = localStorage.getItem('DataTables_Expense/Categories')
          let dataTableState = JSON.parse(state)
          that.setFormState(dataTableState)
          return dataTableState
        } else {
          that.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.state.clear();
          });
          return null;
        }
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.loadData(dataTablesParameters,callback)
      },
      columns: [
        {data: 'category_name', name: 'categoryName'},
        {data: 'amount', name : 'amount'}
      ]
    };
  }

  loadData(dataTablesParameters?: any, callback?: any){
    const payload = {
      ...dataTablesParameters,
      end_date: this.formatDate(this.categoriesFilterForm?.value?.date?.endDate),
      start_date: this.formatDate(this.categoriesFilterForm?.value?.date?.startDate)
    };
    this.expenseService.getCategoryList(Object.assign(payload)).subscribe(
      (res: any) => {
        this.isResetloading = false
        this.tbody = res?.data;

        this.chartConfigure(this.tbody)
        callback({
          recordsTotal: res?.recordsTotal,
          recordsFiltered: res?.recordsFiltered,
          data: []
        });
        setTimeout(() => {
          this.datatableElement?.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.columns.adjust();
          });
        }, 10);
      },(error)=> {
        this.isResetloading = false;
        this.toaster.showError(error?.error?.message ?? error?.message)
      }
    )
  }

  setFormState(state) {
    this.categoriesFilterForm.controls['date'].patchValue(
      state?.date?.start_date && state?.date?.end_date 
      ? { startDate: state.date.start_date, endDate: state.date.end_date } 
      : null
    );
  }

  formatDate(date: any): string | null {
    return date ? new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset() * 60000).toISOString().split('T')[0] : null;
  }

  currentSchool(){
    this.expenseService.currentSchool().subscribe((res:any)=>{
      if(res.status){
        this.schoolList = res.data
        this.schoolName = this.schoolList.find((school:any)=> school.id == this.branch_id)?.branchName
      }
    },(error:any)=>{

    })
  }
	
  chartConfigure(tbody: any) {
    let sum = 0
    if (tbody) {
      sum = tbody.reduce((acc: number, element: any) => acc + element.amount, 0);
      this.configArray = []

      this.configArray = tbody.map((row: any) => ({
        name: row.categoryName,
        y: parseFloat(((row.amount / sum) * 100).toFixed(2)),
        amount : row.amount
      })).filter((item: any) => item.y > 0);
      this.chartFunction(this.configArray)
    }
    else {
      this.configArray = [];
    }
  }

  chartFunction(Config: any) {
    // let startDate = this.formatDate(this.categoriesFilterForm?.value?.date?.startDate);
    // let endDate = this.formatDate(this.categoriesFilterForm?.value?.date?.endDate);
    
    // if (startDate) {
    //   startDate = new Date(startDate).toISOString().slice(0, 10).split('-').reverse().join('/');
    // }
    // if (endDate) {
    //   endDate = new Date(endDate).toISOString().slice(0, 10).split('-').reverse().join('/');
    // }
  
    this.chartOptions = {
      chart: {
        type: 'pie'
      },
      title: {
        text: `Expense Report for ${this.schoolName}`
      },
      // ...(startDate && endDate
      //   ? {
      //       subtitle: {
      //         text: `NOTE :- You are viewing Expense Report from ${startDate} to ${endDate}`,
      //         style: {
      //           fontSize: '12px',
      //           color: '#666666'
      //         },
      //         align: 'center'
      //       }
      //     }
      //   : {}),
      tooltip: {
        pointFormat: `
          {series.name}: <b>{point.percentage:.1f}%</b><br/>
          Amount: <b>{point.amount}</b>
        `
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %<br/>Amount: {point.amount}'
          }
        }
      },
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        itemMarginBottom: 10
      },
      series: [
        {
          name: 'Share',
          type: 'pie',
          data: Config,
          showInLegend: true
        }
      ]
    };
  
    setTimeout(() => {
      this.updateFlag = true;
      this.cdr.detectChanges();
    }, 200);
  }
  
  //#endregion Private methods
}