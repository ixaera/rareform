import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User, UserService } from './user.service';

@Injectable()
export class MockUserService extends UserService {
  getUser(): Observable<User> {
    return of({ plannerName: 'Demo Planner' });
  }
}
