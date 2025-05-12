import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTransportListComponent } from './assign-transport-list.component';

describe('AssignTransportListComponent', () => {
  let component: AssignTransportListComponent;
  let fixture: ComponentFixture<AssignTransportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignTransportListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTransportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
