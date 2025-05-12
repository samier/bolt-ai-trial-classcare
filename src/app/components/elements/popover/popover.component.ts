import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/popover';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss']
})
export class PopoverComponent implements OnInit {

  public isCollapsed = true;
  public isCollapsed2 = true;
  public isCollapsed3 = true;

  constructor() { }

  ngOnInit(): void {
  }
  html1: string = codeData.popHTML1;
  ts1: string = codeData.popTS1;
  html2: string = codeData.popHTML2;
  ts2: string = codeData.popTS2;
  html3: string = codeData.popHTML3;
  ts3: string = codeData.popTS3;

}
