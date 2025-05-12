import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDiaryListComponent } from './admin-diary-list.component';

describe('AdminDiaryListComponent', () => {
  let component: AdminDiaryListComponent;
  let fixture: ComponentFixture<AdminDiaryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDiaryListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDiaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
