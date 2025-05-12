import { Component, OnInit } from '@angular/core';
import * as codeData from '../../../shared/prismData/images';
@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  html1: string = codeData.imageHTML1;
  ts1: string = codeData.imageTS1;
  html2: string = codeData.imageHTML2;
  ts2: string = codeData.imageTS2;
  html3: string = codeData.imageHTML3;
  ts3: string = codeData.imageTS3;
  html4: string = codeData.imageHTML4;
  ts4: string = codeData.imageTS4;
}
