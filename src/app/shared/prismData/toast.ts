export let toastHTML1 = 
`<ngb-toast *ngIf="show" header="Hello" [autohide]="false" (hidden)="show=false">
    I am a simple static toast with a header.
</ngb-toast>`
export let toastTS1 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  show = true;
}`

export let toastHTML2 = 
`<ngb-toast *ngIf="show1" [autohide]="false" (hidden)="show1=false">
    <ng-template ngbToastHeader>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path
                d="M16.896 10l-4.896-8-4.896 8-7.104-4 3 11v5h18v-5l3-11-7.104 4zm-11.896 10v-2h14v2h-14zm14.2-4h-14.4l-1.612-5.909 4.615 2.598 4.197-6.857 4.197 6.857 4.615-2.598-1.612 5.909z" />
        </svg>
        <strong class="mx-1">Fancy</strong>header notification
    </ng-template>
    Hello, I am toast. Have you noticed my header has been generated from a Template?
</ngb-toast>`
export let toastTS2 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  show1 = true;
}`
export let PLACEMENT_HTML = `
<div class="text-wrap  mb-3">
						<div class="example">
							<div class="ht-150 pos-relative mb-3">
								<div class="demo-static-toast pos-absolute t-10">
									<ngb-toast *ngIf="show3" [autohide]="false" (hidden)="show3=false">
									  <ng-template ngbToastHeader>
										<h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6><small class="text-muted me-3">11 mins ago</small>
									  </ng-template>
									  Hello, world! This is a toast message.
									</ngb-toast>
								</div>
							</div>
						</div>
					</div>
					<div class="text-wrap  mb-3">
						<div class="example">
							<div class="demo-static-toast d-flex justify-content-center align-items-center">
								<ngb-toast *ngIf="show5" [autohide]="false" (hidden)="show4=false">
									<ng-template ngbToastHeader>
									  <h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6><small class="text-muted me-3">11 mins ago</small>
									</ng-template>
									Hello, world! This is a toast message.
								  </ngb-toast>
							</div>
						</div>
					</div>
					<div class="text-wrap ">
						<div class="example">
							<div class="ht-150 pos-relative">
								<div class="demo-static-toast pos-absolute b-10 r-10">
									<ngb-toast *ngIf="show4" [autohide]="false" (hidden)="show4=false">
										<ng-template ngbToastHeader>
										  <h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6><small class="text-muted me-3">11 mins ago</small>
										</ng-template>
										Hello, world! This is a toast message.
									</ngb-toast>
								</div>
							</div>
						</div>
					</div>
`

export let PLACEMENT_TS = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  show3 = true;
  show4 = true;
  show4 = true;
`

export let toastHTML3 = 
`<ngb-toast *ngIf="show2" [autohide]="false" (hidden)="show2=false">
    <ng-template ngbToastHeader>
        <h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6>
        <small class="text-muted">Just now</small>
    </ng-template>
    See? Just like this.
</ngb-toast>
<ngb-toast *ngIf="show3" [autohide]="false" (hidden)="show3=false">
    <ng-template ngbToastHeader>
        <h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6>
        <small class="text-muted">11 mins ago</small>
    </ng-template>
    Hello, world! This is a toast message.
</ngb-toast>`
export let toastTS3 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  show2 = true;
  show3 = true;
}`

export let toastHTML4 = 
`<ngb-toast *ngIf="isclose" header="Click my close icon →" [autohide]="false" (hidden)="close()">
    If you close me, I will automatically re-appear after a few seconds.
</ngb-toast>
<p *ngIf="!isclose">I'll be back!</p>`
export let toastTS4 = 
`import { Component } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  
  isclose = true;

  close() {
    this.isclose = false;
    setTimeout(() => this.isclose = true, 3000);
  }
}`

export let toastHTML5 = 
`<div class="example">
	
  <p>Please click one of the button to see a Toast being displayed in the top right corner of your
    screen:</p>
  <button class="btn btn-primary" (click)="showStandard()"
    ngbTooltip="Will disappear in 5s">Standard toast</button>&nbsp;
  <button class="btn btn-success" (click)="showSuccess()"
    ngbTooltip="Will disappear in 10s">Success toast</button>&nbsp;

  <ng-template #dangerTpl>
    <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" width="24" height="24"
      viewBox="0 0 24 24">
      <path
        d="M10.872 6.831l1.695 3.904 3.654-1.561-1.79 3.426 3.333.954-3.417 1.338 2.231 4.196-4.773-2.582-2.869 2.287.413-3.004-3.792-.726 2.93-1.74-1.885-2.512 3.427.646.843-4.626zm-.786-6.831l-1.665 9.119-6.512-1.228 3.639 4.851-5.548 3.294 7.108 1.361-.834 6.076 5.742-4.577 9.438 5.104-4.288-8.064 6.834-2.677-6.661-1.907 3.25-6.22-6.98 2.982-3.523-8.114z" />
    </svg>
    Danger Danger !
  </ng-template>
  <button class="btn btn-danger" (click)="showDanger(dangerTpl)"
    ngbTooltip="Will disappear in 15s">Danger toast</button>&nbsp;

  <app-toast-container aria-live="polite" aria-atomic="true"></app-toast-container>

</div>`
export let toastTS5 = 
`import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {

  show5 = false;
  autohide: boolean = true;

}`
export let tostHTML7 = `
<div class="row">
					<div class="col-xl-12">
					  <div class="row">
						<div class="col-xl-6 col-lg-6 col-md-12">
						  <div class="demo-static-toast mb-2 mt-2">
							<ngb-toast *ngIf="show5" [autohide]="false" (hidden)="show5=false" class="primary-toast">
							  <ng-template ngbToastHeader >
								  <i class="fe fe-home me-2"></i><h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6><small class="me-3">11 mins ago</small>
							  </ng-template>
							  Hello, world! This is a toast message.
							</ngb-toast>
						  </div>
						</div>
						<div class="col-xl-6 col-lg-6 col-md-12">
						  <div class="demo-static-toastmt-2 mb-2">
							<ngb-toast *ngIf="show6" [autohide]="false" (hidden)="show6=false" class="secondary-toast">
							  <ng-template ngbToastHeader >
								  <i class="fe fe-compass me-2"></i><h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6><small class="me-3">11 mins ago</small>
							  </ng-template>
							  Hello, world! This is a toast message.
							</ngb-toast>
						  </div>
						</div>
						<div class="col-xl-6 col-lg-6 col-md-12">
						  <div class="demo-static-toast mt-2 mb-2">
							<ngb-toast *ngIf="show7" [autohide]="false" (hidden)="show7=false" class="success-toast">
							  <ng-template ngbToastHeader >
								  <i class="fe fe-check-circle me-2"></i><h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6><small class="me-3">11 mins ago</small>
							  </ng-template>
							  Hello, world! This is a toast message.
							</ngb-toast>
						  </div>
						</div>
						<div class="col-xl-6 col-lg-6 col-md-12">
						  <div class="demo-static-toast mt-2 mb-2">
							<ngb-toast *ngIf="show8" [autohide]="false" (hidden)="show8=false" class="info-toast">
							  <ng-template ngbToastHeader >
								  <i class="fe fe-info me-2"></i><h6 class="tx-14 mg-b-0 mg-r-auto">Notification</h6><small class="me-3">11 mins ago</small>
							  </ng-template>
							  Hello, world! This is a toast message.
							</ngb-toast>
						  </div>
						</div>
					  </div>
					</div>
				  </div>
`

export let toastTS7 = `
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
show5 = true;
show6 = true;
show7 = true;
show8 = true;
}
`