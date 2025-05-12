import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/pagination';
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {

  public isCollapsed = true;
  public isCollapsed2 = true;
  public isCollapsed3 = true;
  public isCollapsed4 = true;

  constructor() { }

  ngOnInit(): void {
  }
  html1: string = codeData.pageHTML1;
  ts1: string = codeData.pageTS1;
  html2: string = codeData.pageHTML2;
  ts2: string = codeData.pageTS2;
  html3: string = codeData.pageHTML3;
  ts3: string = codeData.pageTS3;
  html4: string = codeData.pageHTML4;
  ts4: string = codeData.pageTS4;

}
