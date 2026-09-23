import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { NavComponent } from './nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  template: `
    <app-nav></app-nav>
    <main style="padding:1rem">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppComponent implements OnInit {
  constructor(private msal: MsalService) {}

  ngOnInit(): void {
    // Procesa la respuesta del redirect (Authorization Code) y fija la cuenta activa
    this.msal.instance.initialize().then(() =>
      this.msal.instance.handleRedirectPromise().then(result => {
        if (result?.account) {
          this.msal.instance.setActiveAccount(result.account);
        } else if (!this.msal.instance.getActiveAccount()) {
          const accounts = this.msal.instance.getAllAccounts();
          if (accounts.length > 0) {
            this.msal.instance.setActiveAccount(accounts[0]);
          }
        }
      })
    );
  }
}
