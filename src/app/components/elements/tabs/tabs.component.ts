import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/tabs';
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit {


  public isCollapsed = true;
  public isCollapsed2 = true;
  public isCollapsed3 = true;
  public isCollapsed4 = true;
  public isCollapsed5 = true;


  constructor() { }

  ngOnInit(): void {
  }
  html1: string = codeData.tabsHTML1;
  ts1: string = codeData.tabsTS1;
  html2: string = codeData.tabsHTML2;
  ts2: string = codeData.tabsTS2;
  html3: string = codeData.tabsHTML3;
  ts3: string = codeData.tabsTS3;
  html4: string = codeData.tabsHTML4;
  ts4: string = codeData.tabsTS4;
  html5: string = codeData.tabsHTML5;
  ts5: string = codeData.tabsTS5;

}
