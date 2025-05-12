import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-modules',
  template: `
    <app-full-layout>
      <router-outlet>
      </router-outlet>
    </app-full-layout>
  `,
})
export class PrivateCompoent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }
}
