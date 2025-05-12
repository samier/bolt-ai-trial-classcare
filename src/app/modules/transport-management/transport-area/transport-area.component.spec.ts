import { ComponentFixture, TestBed } from '@angular/core/testing';

import { transportAreaComponent } from './transport-area.component';

describe('transportAreaComponent', () => {
  let component: transportAreaComponent;
  let fixture: ComponentFixture<transportAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ transportAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(transportAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
