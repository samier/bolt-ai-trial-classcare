import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as Highcharts from 'highcharts';
import { event } from 'jquery';


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {

  Highcharts: typeof Highcharts = Highcharts; // Required Highcharts reference

  @Input() chartOptions: Highcharts.Options = {}; // Chart options input
  @Input() chartConstructor: string = 'chart'; // Optional string, defaults to 'chart'
  @Input() updateFlag: boolean = false; // Update flag
  @Input() oneToOne: boolean = true; // Optional boolean
  @Input() runOutsideAngular: boolean = false; // Optional boolean
  @Input() oneToOneFlag = true;
  @Input() height:number = 400;
  @Output() chartInstance = new EventEmitter()

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartInstance.emit(chart)
    // Example: Add a custom label on the chart after it renders
    // chart.renderer
    //   .text('Custom Label', 100, 100)
    //   .css({
    //     color: '#FF0000',
    //     fontSize: '16px'
    //   })
    //   .add();
    // console.log('Chart has been rendered:', chart);
  };


  constructor() { }

  ngOnInit(): void {

  }
}
