import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with no user', () => {
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  describe('login', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@rareform.dev' };

    it('should return true and set currentUser on success', () => {
      let result: boolean | undefined;
      service.login('testuser', 'testpassword123').subscribe(v => result = v);

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'testuser', password: 'testpassword123' });
      req.flush({ user: mockUser });

      expect(result).toBeTrue();
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false and leave currentUser null on 401', () => {
      let result: boolean | undefined;
      service.login('testuser', 'wrong').subscribe(v => result = v);

      const req = httpMock.expectOne('/api/auth/login');
      req.flush({ error: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      expect(result).toBeFalse();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should call POST /api/auth/logout and clear currentUser', () => {
      // Put the service in an authenticated state first
      (service as any).currentUser.set({ id: 1, username: 'testuser', email: 'test@rareform.dev' });
      expect(service.isAuthenticated()).toBeTrue();

      service.logout().subscribe();

      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush({});

      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('checkAuthStatus', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@rareform.dev' };

    it('should return true and set currentUser when session is valid', () => {
      let result: boolean | undefined;
      service.checkAuthStatus().subscribe(v => result = v);

      const req = httpMock.expectOne('/api/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush({ user: mockUser });

      expect(result).toBeTrue();
      expect(service.currentUser()).toEqual(mockUser);
    });

    it('should return false and clear currentUser when session is invalid', () => {
      (service as any).currentUser.set({ id: 1, username: 'testuser', email: 'test@rareform.dev' });

      let result: boolean | undefined;
      service.checkAuthStatus().subscribe(v => result = v);

      const req = httpMock.expectOne('/api/auth/me');
      req.flush({ error: 'Not authenticated' }, { status: 401, statusText: 'Unauthorized' });

      expect(result).toBeFalse();
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should reflect currentUser signal state', () => {
      expect(service.isAuthenticated()).toBeFalse();
      (service as any).currentUser.set({ id: 1, username: 'testuser', email: 'test@rareform.dev' });
      expect(service.isAuthenticated()).toBeTrue();
    });
  });
});
