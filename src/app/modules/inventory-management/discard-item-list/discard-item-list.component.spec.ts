import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscardItemListComponent } from './discard-item-list.component';

describe('DiscardItemListComponent', () => {
  let component: DiscardItemListComponent;
  let fixture: ComponentFixture<DiscardItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiscardItemListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscardItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
