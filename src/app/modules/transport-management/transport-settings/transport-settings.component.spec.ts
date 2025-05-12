import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportSettingsComponent } from './transport-settings.component';

describe('TransportSettingsComponent', () => {
  let component: TransportSettingsComponent;
  let fixture: ComponentFixture<TransportSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransportSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
