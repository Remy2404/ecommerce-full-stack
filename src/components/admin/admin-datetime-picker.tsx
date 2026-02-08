'use client';

import DateTimePicker from 'react-datetime-picker';
import { cn } from '@/lib/utils';

type PickerDate = Date | null;
type PickerValue = PickerDate | [PickerDate, PickerDate];
type CalendarTileArgs = { date: Date; view: string };

export interface AdminDateTimePickerProps {
  valueIso: string | undefined;
  onChangeIso: (iso: string) => void;
  label?: string;
  required?: boolean;
  minIso?: string;
  maxIso?: string;
  disabled?: boolean;
  className?: string;
  format?: string;
  disableClock?: boolean;
  showClearIcon?: boolean;
  rangeStartIso?: string;
  showRangePreview?: boolean;
}

const parseIsoToDate = (valueIso?: string): Date | null => {
  if (!valueIso) return null;
  const parsed = new Date(valueIso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
const dayTimestamp = (date: Date) => startOfDay(date).getTime();
const isSameDay = (a: Date, b: Date) => dayTimestamp(a) === dayTimestamp(b);

const normalizePickerValue = (value: PickerValue): Date | null => {
  if (Array.isArray(value)) {
    return value[1] ?? value[0] ?? null;
  }
  return value;
};

export function AdminDateTimePicker({
  valueIso,
  onChangeIso,
  label,
  required = false,
  minIso,
  maxIso,
  disabled = false,
  className,
  format = 'y-MM-dd HH:mm',
  disableClock = false,
  showClearIcon = true,
  rangeStartIso,
  showRangePreview = false,
}: AdminDateTimePickerProps) {
  const selectedDate = parseIsoToDate(valueIso);
  const minDateRaw = parseIsoToDate(minIso);
  const maxDateRaw = parseIsoToDate(maxIso);
  const rangeStartDate = parseIsoToDate(rangeStartIso);
  const isDateOnlyFormat = !/[hHmsa]/.test(format);

  const minDate = minDateRaw ? (isDateOnlyFormat ? startOfDay(minDateRaw) : minDateRaw) : null;
  const maxDate = maxDateRaw ? (isDateOnlyFormat ? endOfDay(maxDateRaw) : maxDateRaw) : null;

  const normalizedRangeStart = rangeStartDate ? startOfDay(rangeStartDate) : null;
  const normalizedSelectedDate = selectedDate ? startOfDay(selectedDate) : null;
  const enableRangePreview = Boolean(showRangePreview && normalizedRangeStart);

  const rangeStart = normalizedRangeStart;
  const rangeEnd = normalizedSelectedDate && rangeStart && dayTimestamp(normalizedSelectedDate) >= dayTimestamp(rangeStart)
    ? normalizedSelectedDate
    : null;

  const calendarProps = enableRangePreview
    ? ({
        className: 'admin-calendar',
        tileDisabled: ({ date, view }: CalendarTileArgs) =>
          Boolean(view === 'month' && rangeStart && dayTimestamp(date) < dayTimestamp(rangeStart)),
        tileClassName: ({ date, view }: CalendarTileArgs) => {
          if (view !== 'month' || !rangeStart) return null;

          const classes: string[] = [];
          const currentDay = startOfDay(date);
          const currentTimestamp = dayTimestamp(currentDay);
          const rangeStartTimestamp = dayTimestamp(rangeStart);

          if (currentTimestamp < rangeStartTimestamp) {
            classes.push('admin-range-disabled');
          }

          if (isSameDay(currentDay, rangeStart)) classes.push('admin-range-start');
          if (rangeEnd && isSameDay(currentDay, rangeEnd)) classes.push('admin-range-end');

          if (rangeEnd && currentTimestamp > rangeStartTimestamp && currentTimestamp < dayTimestamp(rangeEnd)) {
            classes.push('admin-range-middle');
          }

          return classes.length ? classes.join(' ') : null;
        },
      } as const)
    : { className: 'admin-calendar' };

  return (
    <div className={cn('space-y-1', className)}>
      {label ? <label className="block text-sm text-muted-foreground">{label}</label> : null}
      <DateTimePicker
        value={selectedDate}
        onChange={(nextValue) => {
          const normalized = normalizePickerValue(nextValue as PickerValue);
          if (!normalized) {
            onChangeIso('');
            return;
          }
          onChangeIso(normalized.toISOString());
        }}
        minDate={minDate ?? undefined}
        maxDate={maxDate ?? undefined}
        disabled={disabled}
        required={required}
        clearIcon={required || !showClearIcon ? null : undefined}
        format={format}
        disableClock={disableClock}
        dayPlaceholder="dd"
        monthPlaceholder="mm"
        yearPlaceholder="yyyy"
        hourPlaceholder="hh"
        minutePlaceholder="mm"
        className="admin-datetime-picker"
        calendarProps={calendarProps}
        clockProps={{ className: 'admin-clock' }}
      />
    </div>
  );
}
 
