import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { Toastr } from 'src/app/core/services/toastr';
import { StudentDashboardService } from '../student-dashboard.service';
import * as Highcharts from 'highcharts';


@Component({
  selector: 'app-new-admission',
  templateUrl: './new-admission.component.html',
  styleUrls: ['./new-admission.component.scss']
})
export class NewAdmissionComponent implements OnInit {
  //#region Public | Private Variables

  isLoading = true;
  noDataFound = false;
  height = 400; // Adjust height as needed
  updateFlag = false;
  chartOptions: any;
  Highcharts: typeof Highcharts = Highcharts;
  newAdmissionDataCount: any
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
    this.getNewAdmissionData();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.getNewAdmissionData()
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
      title: { text: 'New Admission' },
      xAxis: { categories: [] },
      yAxis: { title: { text: 'Number of Admission' } },
      series: []
    };
  }

  getNewAdmissionData() {
    this.isLoading = true;
    const paylod = {
      filter_by_new: true
    }
    this._studentDashboardService.getNewAdmissionAndStrengthData(paylod)
      .pipe(takeUntil(this.$destroy))
      .subscribe((res: any) => {
        if (res.data) {
          this.newAdmissionDataCount = res.data;
          this.updateChartData(this.newAdmissionDataCount)

        } else {
          this._toaster.showError(res.message);
          this.isLoading = false;
        }
      }, error => {
        this._toaster.showError(error?.error?.message ?? error?.message);
        this.isLoading = false;
      });
  }

  updateChartData(data) {
    // Extract class names (x-axis categories)
    const categories = data.map(item => item.academic_year);

    // Extract boys' and girls' counts (series data)
    const studentData = data.map(item => item.student_count);

    // Update Chart Options
    this.chartOptions = {
      ...this.chartOptions,
      xAxis: { categories },
      series: [
        { type: 'column', name: 'New Admission', data: studentData, color: '#F2BBE5' },
      ]
    };

    this.updateFlag = true; // Trigger chart update
    this.isLoading = false;
  }

  //#endregion Private methods
}
