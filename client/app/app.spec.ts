import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { App } from './app';
import { UserService } from './services/user.service';
import { MockUserService } from './services/mock-user.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: UserService, useClass: MockUserService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  describe('browser title', () => {
    it('should set the browser title from UserService on init', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      expect(TestBed.inject(Title).getTitle()).toBe('Demo Planner');
    });

    it('should reflect a different plannerName when UserService returns one', () => {
      const userService = TestBed.inject(UserService);
      spyOn(userService, 'getUser').and.returnValue(of({ plannerName: 'My Real Planner' }));

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      expect(TestBed.inject(Title).getTitle()).toBe('My Real Planner');
    });
  });
});
