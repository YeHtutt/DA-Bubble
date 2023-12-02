import { Injectable } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class DialogAnimationService {

  constructor() { }

  public getDialogAnimations() {
    return [
      trigger('dialog', [
        // State for the hidden dialog
        state('void', style({
          transform: 'translateY(100%)',
          opacity: 0
        })),
        // State for the visible dialog
        state('*', style({
          transform: 'translateY(0)',
          opacity: 1
        })),
        // Transition from bottom to center
        transition('void => *', animate('3000ms ease-out')),
        // Transition from center to bottom
        transition('* => void', animate('3000ms ease-in'))
      ])
    ];
  }
}
