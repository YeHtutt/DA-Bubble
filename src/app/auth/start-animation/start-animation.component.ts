import { Component } from '@angular/core';
import { Router } from '@angular/router';



@Component({
  selector: 'app-start-animation',
  templateUrl: './start-animation.component.html',
  styleUrls: ['./start-animation.component.scss']
})
export class StartAnimationComponent {

  isStarting: boolean = true;
  isIntro = true;

  
  constructor(private router: Router) {
    setTimeout(() => {
      this.isIntro = false;
      this.router.navigate(['/login']);
    }, 3400);
  }
}