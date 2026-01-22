// components/ui/DateRangePicker.tsx
'use client';

import { FC } from 'react';
import { DateRange, Range, OnChangeProps } from 'react-date-range';

interface DateRangePickerProps {
  range: Range;
  onChange: (range: Range) => void;
}

export const DateRangePicker: FC<DateRangePickerProps> = ({ range, onChange }) => (
  <DateRange
    ranges={[range]}
    onChange={(ranges: OnChangeProps) => onChange(ranges.selection)}
    moveRangeOnFirstSelection
    showSelectionPreview
  />
);
