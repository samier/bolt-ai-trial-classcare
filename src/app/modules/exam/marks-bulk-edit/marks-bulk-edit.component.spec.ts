import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarksBulkEditComponent } from './marks-bulk-edit.component';

describe('MarksBulkEditComponent', () => {
  let component: MarksBulkEditComponent;
  let fixture: ComponentFixture<MarksBulkEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarksBulkEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarksBulkEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
