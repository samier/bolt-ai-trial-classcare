import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/buttons';
@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss']
})
export class ButtonsComponent implements OnInit {


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
  public isCollapsed11= true;
  public isCollapsed12 = true;
  public isCollapsed13 = true;
  public isCollapsed14 = true;
  public isCollapsed15 = true;
  public isCollapsed16 = true;
  public isCollapsed17 = true;
  public isCollapsed18 = true;

  constructor() { }

  ngOnInit(): void {
  }

  html1: string = codeData.buttonsHTML1;
  ts1: string = codeData.buttonsTS1;
  html2: string = codeData.buttonsHTML2;
  ts2: string = codeData.buttonsTS2;
  html3: string = codeData.buttonsHTML3;
  ts3: string = codeData.buttonsTS3;
  html4: string = codeData.buttonsHTML4;
  ts4: string = codeData.buttonsTS4;
  html5: string = codeData.buttonsHTML5;
  ts5: string = codeData.buttonsTS5;
  html6: string = codeData.buttonsHTML6;
  ts6: string = codeData.buttonsTS6;
  html7: string = codeData.buttonsHTML7;
  ts7: string = codeData.buttonsTS7;
  html8: string = codeData.buttonsHTML8;
  ts8: string = codeData.buttonsTS8;
  dis:string = codeData.dis;
  html9:string = codeData.buttonsHTML9;
  html10:string = codeData.buttonHTML10
  html11:string = codeData.buttonHTML11
  html12:string = codeData.buttonHTML12
  html13:string = codeData.buttonHTML13
  html14:string = codeData.buttonHTML14
  html15:string = codeData.buttonHTML15
  html16:string = codeData.buttonHTML16
  html17:string = codeData.buttonHTML17
  html18:string = codeData.buttonHTML18
}
