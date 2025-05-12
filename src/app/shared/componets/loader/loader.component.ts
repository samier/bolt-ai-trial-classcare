import { Component, OnInit, Input, Inject } from '@angular/core';
import { Router , NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event as NavigationEvent} from '@angular/router';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  public showLoader: boolean = true;
  public loader = true;

  @Input() display = false;
  constructor( private router: Router  ) { 
    this.router.events.subscribe({
      next: (event:NavigationEvent) => {
        if (event instanceof NavigationStart) {
          this.loader = true;
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
          ){
            this.loader = false;
        }
      },
      error: (e:any) => this.loader = false
    })
  }
  ngOnInit(): void {}

}
