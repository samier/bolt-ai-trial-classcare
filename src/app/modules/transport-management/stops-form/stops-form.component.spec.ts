import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopsFormComponent } from './stops-form.component';

describe('StopsFormComponent', () => {
  let component: StopsFormComponent;
  let fixture: ComponentFixture<StopsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StopsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StopsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
