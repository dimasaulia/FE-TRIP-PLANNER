"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { tripFormSchema, type TripFormValues } from "@/features/trips/schemas/trip-form.schema";
import { usePreferences, type TranslationKey } from "@/modules/preferences";
import { Button } from "@/shared/components/Button";
import { Field, Select, TextArea, TextInput } from "@/shared/components/Field";

const COMMON_ZONES = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore", "Asia/Tokyo", "Asia/Bangkok", "Australia/Sydney", "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "UTC"];

type TripFormProps = {
  defaultValues: TripFormValues;
  submitLabel: string;
  disabled?: boolean;
  busy?: boolean;
  /** Extra fields rendered above the submit button (banner). */
  children?: React.ReactNode;
  onSubmit: (values: TripFormValues) => void;
};

export function TripForm({ defaultValues, submitLabel, disabled, busy, children, onSubmit }: TripFormProps) {
  const { t } = usePreferences();
  const form = useForm<TripFormValues>({ resolver: zodResolver(tripFormSchema), defaultValues });
  const errors = form.formState.errors;
  const message = (code?: string) => (code ? t(`form.${code}` as TranslationKey) : undefined);

  const zones = useMemo(() => {
    const all = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : COMMON_ZONES;
    return Array.from(new Set([defaultValues.timezone, ...COMMON_ZONES, ...all]));
  }, [defaultValues.timezone]);

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <Field error={message(errors.name?.message)} label={t("trips.name")}>
        <TextInput disabled={disabled} placeholder={t("trips.namePlaceholder")} {...form.register("name")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field error={message(errors.start_date?.message)} label={t("trips.startDate")}>
          <TextInput disabled={disabled} type="date" {...form.register("start_date")} />
        </Field>
        <Field error={message(errors.end_date?.message)} label={t("trips.endDate")}>
          <TextInput disabled={disabled} type="date" {...form.register("end_date")} />
        </Field>
      </div>
      <Field hint={t("trips.timezoneHint")} label={t("trips.timezone")}>
        <Select disabled={disabled} {...form.register("timezone")}>
          {zones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>
      </Field>
      <Field error={message(errors.description?.message)} label={t("trips.description")}>
        <TextArea disabled={disabled} rows={3} {...form.register("description")} />
      </Field>
      {children}
      {!disabled ? (
        <Button className="w-full" disabled={busy} type="submit">
          {submitLabel}
        </Button>
      ) : null}
    </form>
  );
}
