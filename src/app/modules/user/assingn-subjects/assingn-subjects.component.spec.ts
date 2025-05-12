import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssingnSubjectsComponent } from './assingn-subjects.component';

describe('AssingnSubjectsComponent', () => {
  let component: AssingnSubjectsComponent;
  let fixture: ComponentFixture<AssingnSubjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssingnSubjectsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssingnSubjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
