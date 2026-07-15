'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { config, getCategory, type CategoryId } from '@/config/config';
import { formatPrice } from '@/lib/utils';
import {
  makeRegistrationSchema,
  type RegistrationFormValues,
  type RegistrationMessages,
} from '@/schemas/registration.schema';
import { Button } from '@/components/ui/Button';
import { Field, SelectInput, TextInput } from '@/components/ui/Field';
import { RadioCards, type RadioCardOption } from '@/components/ui/RadioCards';
import { localeMeta } from '@/config/site';
import { locales } from '@/i18n/config';

interface RegistrationFormProps {
  /** Category pre-selected from the pricing section (?category=…). */
  defaultCategory?: CategoryId;
}

export function RegistrationForm({ defaultCategory }: RegistrationFormProps) {
  const t = useTranslations('register');
  const tc = useTranslations('common');
  const tCat = useTranslations('prices.categories');
  const locale = useLocale();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  // Translated validation messages feed the shared schema factory.
  const schema = useMemo(() => {
    const messages: RegistrationMessages = {
      firstName: t('validation.firstName'),
      lastName: t('validation.lastName'),
      email: t('validation.email'),
      phone: t('validation.phone'),
      category: t('validation.category'),
      memberNumber: t('validation.memberNumber'),
      language: t('validation.language'),
    };
    return makeRegistrationSchema(messages);
  }, [t]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      language: locales.includes(locale as (typeof locales)[number])
        ? (locale as RegistrationFormValues['language'])
        : config.defaultLocale,
      category: defaultCategory,
      memberNumber: '',
      payNow: false,
      website: '',
    },
  });

  const category = watch('category');
  const payNow = watch('payNow');
  const activeCategory = category ? getCategory(category) : null;

  const categoryOptions: RadioCardOption<CategoryId>[] = config.categories.map((c) => ({
    value: c.id,
    title: tCat(`${c.id}.name`),
    description: tCat(`${c.id}.description`),
    aside: (
      <span className="font-display text-sm font-bold text-gold-gradient">
        {c.price === 0 ? tc('free') : formatPrice(c.price, locale, config.currency)}
      </span>
    ),
  }));

  const payOptions: RadioCardOption<'yes' | 'no'>[] = [
    { value: 'yes', title: t('pay.yes') },
    { value: 'no', title: t('pay.no') },
  ];

  async function onSubmit(values: RegistrationFormValues) {
    setServerError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as { ok: boolean; registrationCode?: string };
      if (!res.ok || !json.ok || !json.registrationCode) {
        setServerError(t('error'));
        return;
      }
      router.push(`/register/success?code=${encodeURIComponent(json.registrationCode)}`);
    } catch {
      setServerError(t('error'));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Identity */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="firstName" label={t('fields.firstName')} required error={errors.firstName?.message}>
          <TextInput
            id="firstName"
            autoComplete="given-name"
            invalid={!!errors.firstName}
            {...register('firstName')}
          />
        </Field>
        <Field id="lastName" label={t('fields.lastName')} required error={errors.lastName?.message}>
          <TextInput
            id="lastName"
            autoComplete="family-name"
            invalid={!!errors.lastName}
            {...register('lastName')}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="email" label={t('fields.email')} required error={errors.email?.message}>
          <TextInput
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            invalid={!!errors.email}
            {...register('email')}
          />
        </Field>
        <Field id="phone" label={t('fields.phone')} required error={errors.phone?.message}>
          <TextInput
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            invalid={!!errors.phone}
            {...register('phone')}
          />
        </Field>
      </div>

      <Field id="language" label={t('fields.language')} required error={errors.language?.message}>
        <SelectInput id="language" invalid={!!errors.language} {...register('language')}>
          {locales.map((l) => (
            <option key={l} value={l}>
              {localeMeta[l].flag} {localeMeta[l].label}
            </option>
          ))}
        </SelectInput>
      </Field>

      {/* Category */}
      <Field id="category" label={t('fields.category')} required error={errors.category?.message}>
        <RadioCards
          name="category"
          legend={t('fields.category')}
          value={category}
          onChange={(v) => {
            setValue('category', v, { shouldValidate: true });
            // Reset conditional fields when the category changes.
            setValue('memberNumber', '');
            setValue('payNow', false);
          }}
          options={categoryOptions}
          invalid={!!errors.category}
        />
      </Field>

      {/* Conditional: VAS member number */}
      {activeCategory?.requiresMemberNumber ? (
        <Field
          id="memberNumber"
          label={t('fields.memberNumber')}
          hint={t('fields.memberNumberHint')}
          required
          error={errors.memberNumber?.message}
        >
          <TextInput
            id="memberNumber"
            invalid={!!errors.memberNumber}
            {...register('memberNumber')}
          />
        </Field>
      ) : null}

      {/* Conditional: student card reminder (verified at the door) */}
      {category === 'STUDENT' ? (
        <p className="flex items-start gap-3 rounded-xl border border-white/10 bg-navy-900/40 p-4 text-sm text-ink-muted">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          {t('studentNote')}
        </p>
      ) : null}

      {/* Conditional: pay-now question OR contributor notice */}
      {activeCategory && activeCategory.canPayNow ? (
        <Field id="payNow" label={t('pay.question')}>
          <RadioCards
            name="payNow"
            legend={t('pay.question')}
            value={payNow ? 'yes' : category ? 'no' : undefined}
            onChange={(v) => setValue('payNow', v === 'yes')}
            options={payOptions}
            columns={2}
          />
        </Field>
      ) : null}

      {activeCategory && activeCategory.requiresApproval && !activeCategory.canPayNow ? (
        <p className="flex items-start gap-3 rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm text-ink-muted">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          {t('contributorNote')}
        </p>
      ) : null}

      {/* Honeypot — visually hidden, off-tab, off-autocomplete. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      {serverError ? (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {serverError}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            {t('submitting')}
          </>
        ) : (
          t('submit')
        )}
      </Button>
    </form>
  );
}
