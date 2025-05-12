import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/typhography';

@Component({
  selector: 'app-typography',
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.scss']
})
export class TypographyComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  html1: string = codeData.typhoHTML1;
  ts1: string = codeData.typhoTS1;
  html2: string = codeData.typhoHTML2;
  ts2: string = codeData.typhoTS2;
  html3: string = codeData.typhoHTML3;
  ts3: string = codeData.typhoTS3;
  html4: string = codeData.typhoHTML4;
  ts4: string = codeData.typhoTS4;
}
