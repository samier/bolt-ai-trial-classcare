import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/dropdown';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  public isCollapsed = true;
  public isCollapsed2 = true;
  public isCollapsed3 = true;
  public isCollapsed4 = true;
  public isCollapsed5 = true;
  public isCollapsed6 = true;
  public isCollapsed7 = true;
  public isCollapsed8 = true;
  public isCollapsed9 = true;
  public isCollapsed10 = true;
  public isCollapsed11 = true;
  public isCollapsed12 = true;
  public isCollapsed13 = true;
  public isCollapsed14 = true;

  constructor() { }

  ngOnInit(): void {
  }

  html1: string = codeData.dropdownHTML1;
  ts1: string = codeData.dropdownTS1;
  html2: string = codeData.dropdownHTML2;
  ts2: string = codeData.dropdownTS2;
  html3: string = codeData.dropdownHTML3;
  ts3: string = codeData.dropdownTS3;
  html4: string = codeData.dropdownHTML4;
  ts4: string = codeData.dropdownTS4;
  html5: string = codeData.dropdownHTML5;
  ts5: string = codeData.dropdownTS5;
  html6: string = codeData.dropdownHTML6;
  ts6: string = codeData.dropdownTS6;
  html7: string = codeData.dropdownHTML7;
  ts7: string = codeData.dropdownTS7;
  html8: string = codeData.dropdownHTML8;
  html9: string = codeData.dropdownHTML9;
  html10: string = codeData.dropdownHTML10;
  html11: string = codeData.dropdownHTML11;
  html12: string = codeData.dropdownHTML12;
  html13: string = codeData.dropdownHTML13;
  html14: string = codeData.dropdownHTML14;

}
