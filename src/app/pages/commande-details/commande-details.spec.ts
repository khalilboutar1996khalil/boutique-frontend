import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeDetails } from './commande-details';

describe('CommandeDetails', () => {
  let component: CommandeDetails;
  let fixture: ComponentFixture<CommandeDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandeDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
