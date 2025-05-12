import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacultyTransportComponent } from './faculty-transport.component';

describe('FacultyTransportComponent', () => {
  let component: FacultyTransportComponent;
  let fixture: ComponentFixture<FacultyTransportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacultyTransportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacultyTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
