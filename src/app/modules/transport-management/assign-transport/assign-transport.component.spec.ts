import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTransportComponent } from './assign-transport.component';

describe('AssignTransportComponent', () => {
  let component: AssignTransportComponent;
  let fixture: ComponentFixture<AssignTransportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignTransportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
