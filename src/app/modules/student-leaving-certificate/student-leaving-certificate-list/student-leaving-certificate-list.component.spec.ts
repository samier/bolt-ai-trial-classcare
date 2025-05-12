import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentLeavingCertificateListComponent } from './student-leaving-certificate-list.component';

describe('StudentLeavingCertificateListComponent', () => {
  let component: StudentLeavingCertificateListComponent;
  let fixture: ComponentFixture<StudentLeavingCertificateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentLeavingCertificateListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentLeavingCertificateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
