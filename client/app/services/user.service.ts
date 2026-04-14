import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface User {
  plannerName: string;
}

@Injectable()
export abstract class UserService {
  abstract getUser(): Observable<User>;
}
