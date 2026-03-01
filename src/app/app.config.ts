import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { PlannerDataService } from './services/planner-data.service';
import { MockPlannerDataService } from './services/mock-planner-data.service';
import { UserService } from './services/user.service';
import { MockUserService } from './services/mock-user.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    { provide: PlannerDataService, useClass: MockPlannerDataService },
    { provide: UserService, useClass: MockUserService }
  ]
};
