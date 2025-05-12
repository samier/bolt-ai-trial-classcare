import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalIssueFormComponent } from './internal-issue-form.component';

describe('InternalIssueFormComponent', () => {
  let component: InternalIssueFormComponent;
  let fixture: ComponentFixture<InternalIssueFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternalIssueFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalIssueFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
