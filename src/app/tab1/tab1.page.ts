import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  user$: Observable<firebase.User>;

  constructor(public authService: AuthenticationService, private router: Router) {}
  ngOnInit(): void{
    this.user$ = this.authService.getUser();
  }
  logout(){
    this.authService.SignOut()
    .then(() => {
      this.router.navigateByUrl('login');
    });
  }
}
