import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-scrollspy',
  templateUrl: './scrollspy.component.html',
  styleUrls: ['./scrollspy.component.scss']
})
export class ScrollspyComponent implements OnInit {


  currentSection = 'section1';
  currentMenuId = "menu1";
  currentMenuId1 = "menu2"

  constructor() { }

  ngOnInit(): void {
  }

}
