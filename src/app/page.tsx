'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../core/hooks';
import { openAuthDialog } from '../core/slices/dialogSlice';
import { useT, useI18n } from '../lib/i18n';
import { Reveal } from '../components/ui/reveal';
import { ScrollToTop } from '../components/ui/scroll-to-top';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return <LandingPage />;
}

function LandingPage() {
  const t = useT();
  const { locale, setLocale } = useI18n();
  const dispatch = useAppDispatch();
  const open = () => dispatch(openAuthDialog('login'));

  return (
    <div className="min-h-screen bg-[var(--briefing-bg)]" style={{ fontFamily: 'var(--font-sans-br, system-ui, sans-serif)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--briefing-bg)] border-b border-[var(--rule)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/summary_videos_logo.png" alt="SummaryVideos" className="h-7 w-auto" />
            <span style={{ fontFamily: 'var(--font-display-br, Georgia, serif)' }} className="text-[var(--ink-1)] text-lg">
              SummaryVideos
            </span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-6">
            <a
              href="https://github.com/joaorjoaquim/video-insight-web"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block br-eyebrow hover:text-[var(--ink-1)] transition-colors"
            >
              {t('nav.github')}
            </a>
            <button
              onClick={() => setLocale(locale === 'en' ? 'pt-br' : 'en')}
              className="hidden sm:block font-[var(--font-mono-br,monospace)] text-[11px] font-medium tracking-[0.12em] uppercase text-[var(--ink-2)] hover:text-[var(--play)] border border-[var(--rule)] rounded px-1.5 py-0.5 transition-colors"
            >
              {t('lang.current')}
            </button>
            <button
              onClick={open}
              className="border border-[var(--ink-1)] text-[var(--ink-1)] px-4 py-1.5 text-[11px] font-medium tracking-[0.1em] uppercase hover:bg-[var(--ink-1)] hover:text-[var(--briefing-bg)] transition-colors rounded-[4px]"
              style={{ fontFamily: 'var(--font-mono-br, monospace)' }}
            >
              {t('nav.signIn')}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <Reveal>
        <section className="px-6 pt-20 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="logo-bars"><i/><i/><i/></span>
                <span className="br-eyebrow">§ 00</span>
              </div>
              <div className="br-eyebrow">{t('landing.hero.section')}</div>
            </div>
            <div>
              <h1
                style={{ fontFamily: 'var(--font-display-br, Georgia, serif)', fontSize: 'clamp(2.5rem, 5vw + 1rem, 5.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
                className="text-[var(--ink-1)] mb-7 max-w-[18ch]"
              >
                {t('landing.hero.headline')}{' '}
                <span className="ital-bar">{t('landing.hero.headlineAccent')}</span>{' '}
                {t('landing.hero.headlineSuffix')}
              </h1>
              <p className="text-[var(--ink-2)] text-lg leading-relaxed mb-8 max-w-[40rem]">
                {t('landing.hero.sub')}
              </p>
              <div className="flex gap-3 items-center flex-wrap">
                <button
                  onClick={open}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-[6px] bg-[var(--play)] text-white hover:bg-[var(--play-700)] transition-colors"
                >
                  {t('landing.hero.cta')}
                  <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white ml-1" />
                </button>
                <a href="#how-it-works" className="text-[var(--ink-2)] text-sm hover:text-[var(--ink-1)] transition-colors">
                  {t('landing.hero.ctaSecondary')}
                </a>
              </div>
              <div className="flex gap-4 mt-10 flex-wrap">
                {(['landing.hero.badge1', 'landing.hero.badge2'] as const).map((key) => (
                  <span key={key} className="br-eyebrow">{t(key)}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <hr className="border-[var(--rule)] max-w-7xl mx-auto px-6" />

      {/* Features */}
      <Reveal delay={1}>
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2"><span className="logo-bars"><i/><i/><i/></span><span className="br-eyebrow">§ 01</span></div>
              <div className="br-eyebrow">{t('landing.features.section')}</div>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display-br, Georgia, serif)', fontSize: 'clamp(1.8rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.015em' }} className="text-[var(--ink-1)] max-w-[20ch]">
              {t('landing.features.headline')} <span className="ital-bar">{t('landing.features.headlineAccent')}</span>{t('landing.features.headlineSuffix')}
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
            <div />
            <div className="border-t border-[var(--rule)]">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 py-8 border-b border-[var(--rule)]">
                  <div className="br-eyebrow text-[var(--play-700)]">0{i + 1}</div>
                  <div>
                    <div className="br-eyebrow mb-2">{t(f.kicker)}</div>
                    <div style={{ fontFamily: 'var(--font-display-br, Georgia, serif)', fontSize: '1.4rem', letterSpacing: '-0.01em' }} className="text-[var(--ink-1)] mb-3">{t(f.title)}</div>
                    <p className="text-[var(--ink-2)] text-sm leading-relaxed max-w-[40rem]">{t(f.body)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <hr className="border-[var(--rule)] max-w-7xl mx-auto px-6" />

      {/* Pricing */}
      <Reveal delay={2}>
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2"><span className="logo-bars"><i/><i/><i/></span><span className="br-eyebrow">§ 02</span></div>
              <div className="br-eyebrow">{t('landing.pricing.section')}</div>
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display-br, Georgia, serif)', fontSize: 'clamp(1.8rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.015em' }} className="text-[var(--ink-1)] max-w-[22ch] mb-4">
                {t('landing.pricing.headline')} <span className="ital-bar">{t('landing.pricing.headlineAccent')}</span>{t('landing.pricing.headlineSuffix')}
              </h2>
              <p className="text-[var(--ink-2)] text-sm leading-relaxed max-w-[34rem]">
                {t('landing.pricing.desc')}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <hr className="border-[var(--rule)] max-w-7xl mx-auto px-6" />

      {/* How it works */}
      <Reveal delay={3}>
        <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2"><span className="logo-bars"><i/><i/><i/></span><span className="br-eyebrow">§ 03</span></div>
              <div className="br-eyebrow">{t('landing.steps.section')}</div>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display-br, Georgia, serif)', fontSize: 'clamp(1.8rem, 3vw + 0.5rem, 3rem)', letterSpacing: '-0.015em' }} className="text-[var(--ink-1)] max-w-[20ch]">
              {t('landing.steps.headline')} <span className="ital-bar">{t('landing.steps.headlineAccent')}</span>{t('landing.steps.headlineSuffix')}
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
            <div />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {STEPS.map((s, i) => (
                <div key={s.title}>
                  <div className="br-eyebrow text-[var(--play-700)] mb-4">0{i + 1}</div>
                  <div style={{ fontFamily: 'var(--font-display-br, Georgia, serif)', fontSize: '1.3rem', letterSpacing: '-0.01em' }} className="text-[var(--ink-1)] mb-2">{t(s.title)}</div>
                  <p className="text-[var(--ink-2)] text-sm leading-relaxed">{t(s.body)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <hr className="border-[var(--rule)] max-w-7xl mx-auto px-6" />

      {/* CTA */}
      <Reveal delay={4}>
        <section className="px-6 py-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 items-center">
            <div>
              <div className="flex items-center gap-3"><span className="logo-bars"><i/><i/><i/></span><span className="br-eyebrow">§ —</span></div>
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display-br, Georgia, serif)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }} className="text-[var(--ink-1)] max-w-[14ch] mb-8">
                {t('landing.cta.headline')} <span className="ital-bar">{t('landing.cta.headlineAccent')}</span>{t('landing.cta.headlineSuffix')}
              </h2>
              <button
                onClick={open}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-[6px] bg-[var(--play)] text-white hover:bg-[var(--play-700)] transition-colors"
              >
                {t('landing.cta.button')}
                <span className="inline-block w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-white ml-1" />
              </button>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Footer */}
      <footer className="border-t border-[var(--rule)] px-6 py-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/summary_videos_logo.png" alt="" className="h-5 w-auto" />
          <span style={{ fontFamily: 'var(--font-display-br, Georgia, serif)' }} className="text-[var(--ink-1)] text-base">SummaryVideos</span>
        </div>
        <span className="br-eyebrow">{t('landing.footer.copy')}</span>
      </footer>

      <ScrollToTop />
    </div>
  );
}

const FEATURES = [
  { kicker: 'landing.features.1.kicker', title: 'landing.features.1.title', body: 'landing.features.1.body' },
  { kicker: 'landing.features.2.kicker', title: 'landing.features.2.title', body: 'landing.features.2.body' },
  { kicker: 'landing.features.3.kicker', title: 'landing.features.3.title', body: 'landing.features.3.body' },
  { kicker: 'landing.features.4.kicker', title: 'landing.features.4.title', body: 'landing.features.4.body' },
] as const;

const STEPS = [
  { title: 'landing.steps.1.title', body: 'landing.steps.1.body' },
  { title: 'landing.steps.2.title', body: 'landing.steps.2.body' },
  { title: 'landing.steps.3.title', body: 'landing.steps.3.body' },
] as const;
