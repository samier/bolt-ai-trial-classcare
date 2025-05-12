import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportFacultyComponent } from './export-faculty.component';

describe('ExportFacultyComponent', () => {
  let component: ExportFacultyComponent;
  let fixture: ComponentFixture<ExportFacultyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportFacultyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportFacultyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
