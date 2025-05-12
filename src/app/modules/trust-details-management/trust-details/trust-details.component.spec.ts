import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrustDetailsComponent } from './trust-details.component';

describe('TrustDetailsComponent', () => {
  let component: TrustDetailsComponent;
  let fixture: ComponentFixture<TrustDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrustDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrustDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
