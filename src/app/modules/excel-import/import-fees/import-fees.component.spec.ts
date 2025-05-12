import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportFeesComponent } from './import-fees.component';

describe('ImportFeesComponent', () => {
  let component: ImportFeesComponent;
  let fixture: ComponentFixture<ImportFeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportFeesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
