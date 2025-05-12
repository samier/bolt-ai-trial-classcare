import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WardenListComponent } from './warden-list.component';

describe('WardenListComponent', () => {
  let component: WardenListComponent;
  let fixture: ComponentFixture<WardenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WardenListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WardenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
