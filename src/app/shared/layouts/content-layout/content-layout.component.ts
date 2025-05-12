import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-content-layout',
  templateUrl: './content-layout.component.html',
  styleUrls: ['./content-layout.component.scss']
})
export class ContentLayoutComponent implements OnInit {

  constructor() {
    if(sessionStorage.getItem('DarkTheme') !== null){
      document.querySelector('body')?.classList.add('dark-theme');
  
      document.querySelector('body')?.classList.remove('light-theme');
      document.querySelector('body')?.classList.remove('transparent-theme');
    }
    if (sessionStorage.getItem('TransparentTheme') !== null ) {
      document.querySelector('body')?.classList.add('transparent-theme');
      document.querySelector('body')?.classList.remove('light-theme');
      document.querySelector('body')?.classList.remove('dark-theme');
    }
    if (sessionStorage.getItem('BgImage') !== null) {
      document.querySelector('body')?.classList.add('bg-img1');
    }
   }

  ngOnInit(): void {
    document.body.classList.add('error-3', 'error-page1');
    document.body.classList.remove('horizontal');
  }


  ngOnDestroy(): void {
    document.body.classList.remove('error-3', 'error-page1');
  }
 
}
