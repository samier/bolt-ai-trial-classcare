import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalIssueListComponent } from './internal-issue-list.component';

describe('InternalIssueListComponent', () => {
  let component: InternalIssueListComponent;
  let fixture: ComponentFixture<InternalIssueListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternalIssueListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalIssueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
