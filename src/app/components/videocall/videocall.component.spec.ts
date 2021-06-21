import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerapdfComponent } from './videocall.component';

describe('GenerapdfComponent', () => {
  let component: GenerapdfComponent;
  let fixture: ComponentFixture<GenerapdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerapdfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerapdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
