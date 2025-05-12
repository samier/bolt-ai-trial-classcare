import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/breadcrumb';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {

  public isCollapsed = true;
  public isCollapsed2 = true;
  public isCollapsed3 = true;
  public isCollapsed4 = true;
  public isCollapsed5 = true;

  constructor() { }

  ngOnInit(): void {
  }
  html1: string = codeData.breadHTML1;
  ts1: string = codeData.breadTS1;
  html2: string = codeData.breadHTML2;
  ts2: string = codeData.breadTS2;
  html3: string = codeData.breadHTML3;
  ts3: string = codeData.breadTS3;
  html4: string = codeData.breadHTML4;
  ts4: string = codeData.breadTS4;
  html5: string = codeData.breadHTML5;
  ts5: string = codeData.breadTS5;

}
