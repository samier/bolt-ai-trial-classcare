import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/mediaobject';
@Component({
  selector: 'app-mediaobject',
  templateUrl: './mediaobject.component.html',
  styleUrls: ['./mediaobject.component.scss']
})
export class MediaobjectComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  html1: string = codeData.mediaHTML1;
  ts1: string = codeData.mediaTS1;
  html2: string = codeData.mediaHTML2;
  ts2: string = codeData.mediaTS2;
  html3: string = codeData.mediaHTML3;
  ts3: string = codeData.mediaTS3;
  html4: string = codeData.mediaHTML4;
  ts4: string = codeData.mediaTS4;
  html5: string = codeData.mediaHTML5;
  ts5: string = codeData.mediaTS5;

}
