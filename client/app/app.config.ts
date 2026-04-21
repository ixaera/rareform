import { ApplicationConfig, APP_INITIALIZER, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { PlannerDataService } from './services/planner-data.service';
import { HttpPlannerDataService } from './services/http-planner-data.service';
import { UserService } from './services/user.service';
import { MockUserService } from './services/mock-user.service';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    { provide: PlannerDataService, useClass: HttpPlannerDataService },
    { provide: UserService, useClass: MockUserService },
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.checkAuthStatus(),
      deps: [AuthService],
      multi: true,
    },
  ]
};
