import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalIssueReturnFormComponent } from './internal-issue-return-form.component';

describe('InternalIssueReturnFormComponent', () => {
  let component: InternalIssueReturnFormComponent;
  let fixture: ComponentFixture<InternalIssueReturnFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternalIssueReturnFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalIssueReturnFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
