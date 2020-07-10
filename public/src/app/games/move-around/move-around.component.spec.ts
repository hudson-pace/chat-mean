import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveAroundComponent } from './move-around.component';

describe('MoveAroundComponent', () => {
  let component: MoveAroundComponent;
  let fixture: ComponentFixture<MoveAroundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveAroundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveAroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
