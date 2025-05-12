import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionalFeesStudentLogComponent } from './optional-fees-student-log.component';
describe('OptionalFeesStudentLogComponent', () => {
  let component: OptionalFeesStudentLogComponent;
  let fixture: ComponentFixture<OptionalFeesStudentLogComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionalFeesStudentLogComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(OptionalFeesStudentLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
