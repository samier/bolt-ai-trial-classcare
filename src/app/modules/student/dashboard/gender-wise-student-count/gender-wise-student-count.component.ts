import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { StudentDashboardService } from '../student-dashboard.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-gender-wise-student-count',
  templateUrl: './gender-wise-student-count.component.html',
  styleUrls: ['./gender-wise-student-count.component.scss']
})
export class GenderWiseStudentCountComponent implements OnInit {
  //#region Public | Private Variables

  isLoading = true;
  noDataFound = false;
  height = 400; // Adjust height as needed
  updateFlag = false;
  chartOptions: any;
  Highcharts: typeof Highcharts = Highcharts;
  genderDataCount: any
  private $destroy = new Subject<void>();

  //#endregion Public | Private Variables

  // --------------------------------------------------------------------------------------------------------------
  // #region constructor
  // --------------------------------------------------------------------------------------------------------------

  constructor(public CommonService: CommonService,
    private _toaster: Toastr,
    private _studentDashboardService: StudentDashboardService
  ) { }


  //#endregion constructor

  // --------------------------------------------------------------------------------------------------------------
  // #region Lifecycle hooks
  // --------------------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.initializeChart();
    this.getGenderData();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.getGenderData()
  // }

  //#endregion Lifecycle hooks

  // --------------------------------------------------------------------------------------------------------------
  // #region Public methods
  // --------------------------------------------------------------------------------------------------------------

  callBack(event) {
    // this.chartInstance = event
  }

  //#endregion Public methods


  // --------------------------------------------------------------------------------------------------------------
  // #region Private methods
  // --------------------------------------------------------------------------------------------------------------

  initializeChart() {
    this.chartOptions = {
      chart: { type: 'column' },
      title: { text: 'Gender-wise Student Count' },
      xAxis: { categories: [] },
      yAxis: { title: { text: 'Number of Students' } },
      series: []
    };
  }

  getGenderData() {
    this.isLoading = true;

    this._studentDashboardService.getGenderData()
      .pipe(takeUntil(this.$destroy))
      .subscribe((res: any) => {
        if (res.data) {
          this.genderDataCount = res.data;
          this.genderDataCount.pop();
          this.updateChartData(this.genderDataCount)

        } else {
          this.isLoading = false;
          this._toaster.showError(res.message);
        }
      }, error => {
        this._toaster.showError(error?.error?.error ?? error?.message ?? error?.error?.message);
        this.isLoading = false;
      });
  }

  updateChartData(data) {
    // Extract class names (x-axis categories)
    const categories = data.map(item => item.class);

    // Extract boys' and girls' counts (series data)
    const boysData = data.map(item => item.boys);
    const girlsData = data.map(item => item.girls);

    // Update Chart Options
    this.chartOptions = {
      ...this.chartOptions,
      xAxis: { categories },
      series: [
        { type: 'column', name: 'Boys', data: boysData, color : '#84A3FD' },
        { type: 'column', name: 'Girls', data: girlsData, color : '#FA931E' }
      ]
    };

    this.updateFlag = true; // Trigger chart update
    this.isLoading = false;
  }

  //#endregion Private methods
}
