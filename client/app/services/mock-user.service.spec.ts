import { TestBed } from '@angular/core/testing';
import { MockUserService } from './mock-user.service';
import { User } from './user.service';

describe('MockUserService', () => {
  let service: MockUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MockUserService] });
    service = TestBed.inject(MockUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser()', () => {
    it('should return an Observable', () => {
      const result = service.getUser();
      expect(typeof result.subscribe).toBe('function');
    });

    it('should emit a user with a plannerName string', (done) => {
      service.getUser().subscribe((user: User) => {
        expect(typeof user.plannerName).toBe('string');
        done();
      });
    });

    it('should return "Demo Planner" as the plannerName', (done) => {
      service.getUser().subscribe(user => {
        expect(user.plannerName).toBe('Demo Planner');
        done();
      });
    });

    it('should complete synchronously after one emission', () => {
      let emitCount = 0;
      let completed = false;

      service.getUser().subscribe({
        next: () => emitCount++,
        complete: () => (completed = true)
      });

      expect(emitCount).toBe(1);
      expect(completed).toBe(true);
    });
  });
});
