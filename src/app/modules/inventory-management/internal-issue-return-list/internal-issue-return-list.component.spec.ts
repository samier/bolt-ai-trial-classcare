import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalIssueReturnListComponent } from './internal-issue-return-list.component';

describe('InternalIssueReturnListComponent', () => {
  let component: InternalIssueReturnListComponent;
  let fixture: ComponentFixture<InternalIssueReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternalIssueReturnListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalIssueReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
