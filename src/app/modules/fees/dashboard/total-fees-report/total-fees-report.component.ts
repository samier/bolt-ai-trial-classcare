import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Toastr } from 'src/app/core/services/toastr';
import { FeesService } from '../../fees.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-total-fees-report',
  templateUrl: './total-fees-report.component.html',
  styleUrls: ['./total-fees-report.component.scss']
})
export class TotalFeesReportComponent implements OnInit, OnChanges {
  //#region Public | Private Variables
  
  $destroy: Subject<void> = new Subject<void>();
  dashboardForm : FormGroup = new FormGroup({})
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: '#fff', // Light background for better contrast
      plotShadow: true, // Adds a subtle shadow effect
    },
    title: {
      text: 'Payment Methods Breakdown',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        display: 'none',
      },
    },
    tooltip: {
      headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
      pointFormat: `<span style="color:{point.color}">\u25CF</span> <b>{point.name}</b>: {point.percentage:.1f}%<br/>Amount: <b>{point.y:.2f}</b>`,
      style: {
        fontSize: '12px',
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b> <br> {point.y:.2f} ({point.percentage:.1f}%)', // Includes both value and percentage
          style: {
            fontSize: '12px',
          },
        },
        showInLegend: true,
      },
    },
    legend: {
      layout: 'vertical', // Vertical layout for better readability on the side
      align: 'right', // Align legend to the right
      verticalAlign: 'middle', // Vertically center the legend
      itemStyle: {
        fontSize: '12px',
        color: '#333',
      },
      itemMarginBottom: 8,
    },
    series: [
      {
        type: 'pie',
        // name: 'Payment Share',
        data: [],
      },
    ],
  };
  chartInstance!: Highcharts.Chart;
  height : number = 250
  isCollapse : boolean = false
  feesData:any = []
  isLoading : boolean = false
  updateFlag : boolean = false
  totalCollection : number = 0
  @Input() yearsList = []
  branchList:any = []
  @Input() currentYear:string = ''
  noDataFound : boolean = false
  branch = ''
  //#endregion Public | Private Variables
  
  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------
  
  constructor(public CommonService: CommonService,
    private _fb : FormBuilder,
    private _feesService : FeesService,
    private _toaster : Toastr
  ) {}
  
  
  //#endregion constructor
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------
  
  ngOnInit(): void {
    this.initForm();
  }
  
  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const currentYear = this.yearsList.find((ele:any) => ele.name == this.currentYear)
    if (currentYear && this.dashboardForm && changes['yearsList']?.currentValue.length > 0) {
      this.dashboardForm.get('academicYear')?.patchValue([currentYear]);
      this.getFeesCollectionData();
    }
  }
  
  //#endregion Lifecycle hooks
  
  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  branchWiseChart(item) {
    let chartData
    this.noDataFound = false
    this.totalCollection = 0
    if (item.name == 'All Branch') {
      chartData = this.feesData.collections.map((ele) => {
        return { name: ele.category, y: ele.value }
      })
    } else {
      const branchData = this.feesData.branch_wise_fees.find(ele => ele.branch_name == item.name);
      if (branchData) {
        chartData = Object.keys(branchData)
        .filter(key => {
          return key !== 'branch_name' && key !== 'total_fees';
        })
        .map(key => ({
          name: key,
          y: branchData[key]
        }));
      } else {
        this.noDataFound = true
      }
    }

    if (chartData) {
      this.totalCollection = chartData.reduce((total, item) => total + item.y, 0)
      const series = this.chartInstance.series[0];
      series.setData(chartData, true);
    }
  }

  callBack(event) {
    this.chartInstance = event
  }
  
  //#endregion Public methods
  

  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------
  initForm() {
    this.dashboardForm = this._fb.group({
      academicYear: [],
      dates : ['']
    })
  }

  getFeesCollectionData() {
    const payload = {
      // dates: this.dashboardForm?.value?.dates?.startDate ? [this.dashboardForm?.value?.dates.startDate?.format('YYYY-MM-DD'),this.dashboardForm?.value?.dates.endDate?.format('YYYY-MM-DD')] :[],
      academicYear: this.dashboardForm?.value?.academicYear?.length > 0 ? this.dashboardForm.value.academicYear.map(ele => ele.id) : [],
      branches: []
    }

    this.isLoading = true
    this._feesService.getFeesReportData(payload).pipe(takeUntil(this.$destroy)).subscribe((res: any) => {
      if (res.status) {
        this.feesData = res.data
        const chartData = res.data.collections.map((ele)=> {
          return { name: ele.category, y: ele.value }
        })
        this.totalCollection = res.data.totalFees.total_fees ? res.data.totalFees.total_fees : chartData.reduce((total, item) => total + item.y,0 )
        this.updateChartData(chartData);
        const branch = this.feesData.branch_wise_fees.map((ele, index) => {
          return { id: index, name: ele.branch_name }
        })

        this.branchList = [{ id: '', name: 'All Branch' }].concat(branch);

        this.branch = ''
        this.isLoading = false

      } else {
        this._toaster.showError(res.message)
      }
    }, (error) => {
      this._toaster.showError(error?.error?.message ?? error?.message)
    })
  }

  updateChartData(data) {
    (this.chartOptions.series as Highcharts.SeriesOptionsType[])[0] = {
      type: 'pie',
      data: data,
    };
    this.updateFlag = true;
  }
  
  //#endregion Private methods
}
