import { appConfig } from './app.config';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

describe('appConfig', () => {
  // Regression guard: the TimeBannerComponent uses @fadeSlideIn animation trigger.
  // Without an animations provider, Angular throws NG05105 at runtime when the
  // banner appears, which breaks rendering of sibling components (daily-tasks,
  // weekly-goals) and causes navigation to appear stuck.
  it('should include an animations provider', () => {
    // provideAnimationsAsync() returns an EnvironmentProviders object.
    // These are opaque wrappers — not plain {provide, useClass} objects.
    // We verify at least one such wrapper exists in the providers array.
    const hasEnvironmentProviders = appConfig.providers.some(p => {
      // EnvironmentProviders have a Symbol key 'ɵproviders' but no 'provide' property
      return (
        p !== null &&
        typeof p === 'object' &&
        !Array.isArray(p) &&
        !('provide' in (p as any)) &&
        typeof (p as any) !== 'function'
      );
    });

    expect(hasEnvironmentProviders)
      .withContext('appConfig must include provideAnimationsAsync() — ' +
        'without it, components using Angular animations (e.g. TimeBannerComponent) ' +
        'throw NG05105 and break rendering of sibling components')
      .toBe(true);
  });
});
