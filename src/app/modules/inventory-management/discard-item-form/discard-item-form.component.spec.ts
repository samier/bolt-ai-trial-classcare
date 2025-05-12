import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscardItemFormComponent } from './discard-item-form.component';

describe('DiscardItemFormComponent', () => {
  let component: DiscardItemFormComponent;
  let fixture: ComponentFixture<DiscardItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscardItemFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscardItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
