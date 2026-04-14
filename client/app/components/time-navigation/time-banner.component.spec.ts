import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TimeBannerComponent } from './time-banner.component';

describe('TimeBannerComponent', () => {
  let component: TimeBannerComponent;
  let fixture: ComponentFixture<TimeBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeBannerComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(TimeBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display past banner text when isPast is true', () => {
    component.isPast = true;
    component.periodLabel = 'Week of Feb 16';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Viewing past');
    expect(el.textContent).toContain('Week of Feb 16');
  });

  it('should display future banner text when isFuture is true', () => {
    component.isFuture = true;
    component.periodLabel = 'Week of Mar 2';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Planning ahead');
    expect(el.textContent).toContain('Week of Mar 2');
  });

  it('should apply past CSS class when isPast is true', () => {
    component.isPast = true;
    fixture.detectChanges();

    const banner = (fixture.nativeElement as HTMLElement).querySelector('.time-banner');
    expect(banner?.classList.contains('past')).toBe(true);
  });

  it('should apply future CSS class when isFuture is true', () => {
    component.isFuture = true;
    fixture.detectChanges();

    const banner = (fixture.nativeElement as HTMLElement).querySelector('.time-banner');
    expect(banner?.classList.contains('future')).toBe(true);
  });

  it('should emit backToToday when button is clicked', () => {
    fixture.detectChanges();
    spyOn(component.backToToday, 'emit');

    const btn = (fixture.nativeElement as HTMLElement).querySelector('.back-to-today-btn') as HTMLButtonElement;
    btn.click();

    expect(component.backToToday.emit).toHaveBeenCalled();
  });

  // Guard test: verifying that the @fadeSlideIn animation trigger is defined.
  // Without an animations provider (provideAnimationsAsync/provideNoopAnimations),
  // Angular throws NG05105 which breaks rendering of sibling components.
  // See: the time-banner appears when navigating away from the current period,
  // and the NG05105 error prevented body components below from updating.
  it('should fail to create without an animations provider', () => {
    // Reset TestBed without animations provider
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TimeBannerComponent]
      // Intentionally no animations provider
    });

    expect(() => {
      const noAnimFixture = TestBed.createComponent(TimeBannerComponent);
      noAnimFixture.detectChanges();
    }).toThrow();
  });
});
