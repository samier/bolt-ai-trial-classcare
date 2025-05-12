import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-modules',
  template: `
    <app-student-details>
    </app-student-details>
  `,
})
export class SharedComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void { 
  }
}
