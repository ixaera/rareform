import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('should allow navigation when user is authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(true);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
  });

  it('should redirect to /login when user is not authenticated', () => {
    const mockUrlTree = {} as UrlTree;
    mockAuthService.isAuthenticated.and.returnValue(false);
    mockRouter.createUrlTree.and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBe(mockUrlTree);
    expect(mockAuthService.isAuthenticated).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should return UrlTree when redirecting', () => {
    const mockUrlTree = {} as UrlTree;
    mockAuthService.isAuthenticated.and.returnValue(false);
    mockRouter.createUrlTree.and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => authGuard());

    expect(result).toBeInstanceOf(Object);
    expect(result).toBe(mockUrlTree);
  });

  it('should not call createUrlTree when user is authenticated', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);

    TestBed.runInInjectionContext(() => authGuard());

    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });
});
