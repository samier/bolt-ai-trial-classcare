import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable, filter, fromEvent } from 'rxjs';
import { LoaderService } from 'src/app/core/services/loader-service';
import { SwUpdate } from '@angular/service-worker';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public isSpinner = true;
  isLoading: any = true;
  isNewVersionAvailable = false;

  constructor(
    public loaderService: LoaderService,
    private swUpdate: SwUpdate,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    //On each route change, trigger check or reload
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log('❓ Is new version is available', this.isNewVersionAvailable);
        if (this.isNewVersionAvailable) {
          this.swUpdate.activateUpdate().then(() => location.reload());
        } else {
          this.swUpdate.checkForUpdate();
        }
    });
  }

  ngOnInit() {
    this.loaderService.loading$.subscribe((newValue: any) => {
      this.isLoading = newValue;
    });
    if ('serviceWorker' in navigator) {
      //Ask the browser for an existing registration of ngsw-worker.js
      navigator.serviceWorker.getRegistrations().then(registrations => {
        // If registration object exists → SW is registered
        if (registrations.length > 0) {
          console.log('✅ Service Worker is registered');
        } else {
          //No registration → SW not registered
          console.log('❌ Service Worker is not registered');
        }
      }).catch(err => {
        console.error('Error checking SW registration:', err);
      });
    } else {
      console.warn('Service Workers are not supported in this browser.');
    }

    console.log('❓  Check swUpdate is enabled', this.swUpdate.isEnabled);
    if (this.swUpdate.isEnabled) {
      // Check for updates periodically
      setInterval(() => {
        console.log('🔄 Check For Update Called');
        this.swUpdate.checkForUpdate();
      }, 30 * 1000); // Check 30 sec

      // When an update is available
      this.swUpdate.versionUpdates.subscribe((evt) => {
        console.log('⚡ VERSION EVENT:', evt);
        switch (evt.type) {
          case 'VERSION_DETECTED':
            console.log(`🔄 Downloading new app version: ${evt.version.hash}`);
            break;
          case 'VERSION_READY':
            console.log(`Current app version: ${evt.currentVersion.hash}`);
            console.log(`✅ New app version ready for use: ${evt.latestVersion.hash}`);
            this.isNewVersionAvailable = true;
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(`❌ Failed to install app version '${evt.version.hash}': ${evt.error}`);
            break;
        }
      });
    }

    // this.isSpinner = false
    // fromEvent(window, 'load').subscribe(() => {document.querySelector('#glb-loader')?.classList.remove('loaderShow'); console.log('completed')});
  }
}
