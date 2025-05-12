import { ComponentFixture, TestBed } from '@angular/core/testing';

import { oldSchoolComponent } from './old-school.component';

describe('oldSchoolComponent', () => {
  let component: oldSchoolComponent;
  let fixture: ComponentFixture<oldSchoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ oldSchoolComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(oldSchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
