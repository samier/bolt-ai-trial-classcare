import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLeavingCertificateEditComponent } from './student-leaving-certificate-edit.component';

describe('StudentLeavingCertificateEditComponent', () => {
  let component: StudentLeavingCertificateEditComponent;
  let fixture: ComponentFixture<StudentLeavingCertificateEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentLeavingCertificateEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentLeavingCertificateEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
