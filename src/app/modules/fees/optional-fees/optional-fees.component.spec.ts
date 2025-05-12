import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionalFeesComponent } from './optional-fees.component';

describe('OptionalFeesComponent', () => {
  let component: OptionalFeesComponent;
  let fixture: ComponentFixture<OptionalFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionalFeesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionalFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
