import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private title = inject(Title);
  private userService = inject(UserService);

  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      this.title.setTitle(user.plannerName);
    });
  }
}
