import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/navigation';
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {

  public isCollapsed = true;
  public isCollapsed2 = true;
  public isCollapsed3 = true;
  public isCollapsed4 = true;
  public isCollapsed5 = true;
  public isCollapsed6 = true;
  public isCollapsed7 = true;
  public isCollapsed8 = true;


  constructor() { }

  ngOnInit(): void {
  }
  html1: string = codeData.navHTML1;
  ts1: string = codeData.navTS1;
  html2: string = codeData.navHTML2;
  ts2: string = codeData.navTS2;
  html3: string = codeData.navHTML3;
  ts3: string = codeData.navTS3;
  html4: string = codeData.navHTML4;
  ts4: string = codeData.navTS4;
  html5: string = codeData.navHTML5;
  ts5: string = codeData.navTS5;
  html6: string = codeData.navHTML6;
  ts6: string = codeData.navTS6;
  html7: string = codeData.navHTML7;
  ts7: string = codeData.navTS7;
  html8: string = codeData.navHTML8;
  ts8: string = codeData.navTS8;

}
