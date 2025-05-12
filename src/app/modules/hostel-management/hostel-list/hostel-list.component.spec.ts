import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostelListComponent } from './hostel-list.component';

describe('HostelListComponent', () => {
  let component: HostelListComponent;
  let fixture: ComponentFixture<HostelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HostelListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
