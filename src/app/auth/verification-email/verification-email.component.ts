import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-verification-email',
  templateUrl: './verification-email.component.html',
  styleUrls: ['./verification-email.component.scss']
})
export class VerificationEmailComponent {
  userEmail: string = '';

  constructor(private authService: AuthenticationService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

}

