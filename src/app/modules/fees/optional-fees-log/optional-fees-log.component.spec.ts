import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionalFeesLogComponent } from './optional-fees-log.component';
describe('OptionalFeesLogComponent', () => {
  let component: OptionalFeesLogComponent;
  let fixture: ComponentFixture<OptionalFeesLogComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionalFeesLogComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(OptionalFeesLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
