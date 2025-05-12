import { ComponentFixture, TestBed } from '@angular/core/testing';

import { certificateComponent } from './certificate-list.component';

describe('certificateComponent', () => {
  let component: certificateComponent;
  let fixture: ComponentFixture<certificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ certificateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(certificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
