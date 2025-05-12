import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeesTabsLayoutComponent } from './fees-tabs-layout.component';

describe('FeesTabsLayoutComponent', () => {
  let component: FeesTabsLayoutComponent;
  let fixture: ComponentFixture<FeesTabsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeesTabsLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeesTabsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
