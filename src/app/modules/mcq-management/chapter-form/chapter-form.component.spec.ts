import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterFormComponent } from './chapter-form.component';

describe('ChapterFormComponent', () => {
  let component: ChapterFormComponent;
  let fixture: ComponentFixture<ChapterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChapterFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChapterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
