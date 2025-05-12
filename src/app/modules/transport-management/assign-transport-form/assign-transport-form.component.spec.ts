import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTransportFormComponent } from './assign-transport-form.component';

describe('AssignTransportFormComponent', () => {
  let component: AssignTransportFormComponent;
  let fixture: ComponentFixture<AssignTransportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignTransportFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTransportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
