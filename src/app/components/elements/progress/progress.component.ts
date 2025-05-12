import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/progress';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  public isCollapsed = true;
  public isCollapsed2 = true;
  public isCollapsed3 = true;
  public isCollapsed4 = true;
  public isCollapsed5 = true;

  constructor() { }

  ngOnInit(): void {
  }

  html1: string = codeData.progressHTML1;
  ts1: string = codeData.progressTS1;
  html2: string = codeData.progressHTML2;
  ts2: string = codeData.progressTS2;
  html3: string = codeData.progressHTML3;
  ts3: string = codeData.progressTS3;
  html4: string = codeData.progressHTML4;
  ts4: string = codeData.progressTS4;
  html5: string = codeData.progressHTML5;
  ts5: string = codeData.progressTS5;

}
