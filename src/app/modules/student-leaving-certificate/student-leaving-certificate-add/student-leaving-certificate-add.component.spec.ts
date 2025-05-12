import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLeavingCertificateAddComponent } from './student-leaving-certificate-add.component';

describe('StudentLeavingCertificateAddComponent', () => {
  let component: StudentLeavingCertificateAddComponent;
  let fixture: ComponentFixture<StudentLeavingCertificateAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentLeavingCertificateAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentLeavingCertificateAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
