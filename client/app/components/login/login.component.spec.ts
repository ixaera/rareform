import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    mockAuthService.isAuthenticated.and.returnValue(false);
    mockAuthService.login.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]),
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to dashboard if already authenticated', () => {
      mockAuthService.isAuthenticated.and.returnValue(true);
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should not redirect if not authenticated', () => {
      component.ngOnInit();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('onLogin', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call authService.login with username and password', () => {
      component.username = 'testuser';
      component.password = 'testpass';
      component.onLogin();
      expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'testpass');
    });

    it('should navigate to dashboard on successful login', () => {
      mockAuthService.login.and.returnValue(of(true));
      component.username = 'testuser';
      component.password = 'testpass';
      component.onLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should set errorMessage on failed login', () => {
      mockAuthService.login.and.returnValue(of(false));
      component.username = 'testuser';
      component.password = 'wrongpass';
      component.onLogin();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.errorMessage).toBeTruthy();
    });

    it('should clear errorMessage before each login attempt', () => {
      mockAuthService.login.and.returnValue(of(false));
      component.onLogin();
      expect(component.errorMessage).toBeTruthy();

      mockAuthService.login.and.returnValue(of(true));
      component.onLogin();
      expect(component.errorMessage).toBe('');
    });
  });

  describe('component properties', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should initialize with empty username', () => {
      expect(component.username).toBe('');
    });

    it('should initialize with empty password', () => {
      expect(component.password).toBe('');
    });

    it('should allow username to be set', () => {
      component.username = 'newuser';
      expect(component.username).toBe('newuser');
    });

    it('should allow password to be set', () => {
      component.password = 'newpass';
      expect(component.password).toBe('newpass');
    });
  });
});
