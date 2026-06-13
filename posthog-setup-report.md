<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the SMA (Subscription Management App) Expo project. PostHog is initialized via a singleton client in `src/config/posthog.ts`, configured from `app.config.js` extras (which read from `.env`). The `PostHogProvider` wraps the app in `app/_layout.tsx`, enabling the `usePostHog()` hook throughout all screens. Screen tracking is performed manually using `usePathname()` in the root layout, consistent with Expo Router best practices. Users are identified on sign-in and sign-up via `posthog.identify()` with their email address, and the session is reset on sign-out.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in (password or MFA) | `app/(auth)/sign-in.tsx` |
| `user_sign_in_failed` | Sign-in attempt fails due to invalid credentials | `app/(auth)/sign-in.tsx` |
| `email_verification_resent` | User requests a new MFA/verification code | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User creates account and completes email verification | `app/(auth)/sign-up.tsx` |
| `email_verification_resent` | User requests a new sign-up verification code | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from the Settings screen | `app/(tabs)/settings.tsx` |
| `subscription_card_expanded` | User expands a subscription card on the Home screen | `app/(tabs)/index.tsx` |
| `subscription_detail_viewed` | User opens the full detail page for a subscription | `app/subscriptions/[id].tsx` |
| `onboarding_viewed` | User lands on the onboarding screen | `app/onboarding.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/201073/dashboard/745735)
- [New sign-ups over time](https://eu.posthog.com/project/201073/insights/Ua0OhBxp)
- [Daily active users](https://eu.posthog.com/project/201073/insights/KO5WzK1p)
- [Sign-up to engagement conversion funnel](https://eu.posthog.com/project/201073/insights/JZ3gvwFT)
- [Subscription card engagement](https://eu.posthog.com/project/201073/insights/4eIPdeLu)
- [Sign-outs over time](https://eu.posthog.com/project/201073/insights/3AdisyZ1)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
