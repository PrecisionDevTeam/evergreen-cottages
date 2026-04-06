import { useState, useMemo } from "react";
import { CalendarDay } from "../types";

type Props = {
  calendar: CalendarDay[];
  onDateSelect?: (date: string) => void;
  checkIn?: string;
  checkOut?: string;
};

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AvailabilityCalendar({ calendar, onDateSelect, checkIn, checkOut }: Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Build lookup: date string → available/price
  const calendarMap = useMemo(() => {
    const map: Record<string, { available: boolean; price: number }> = {};
    for (const day of calendar) {
      if (day.date) {
        const key = day.date.split("T")[0];
        map[key] = {
          available: day.is_available === 1,
          price: day.price || 0,
        };
      }
    }
    return map;
  }, [calendar]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const todayStr = today.toISOString().split("T")[0];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Don't go before current month
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const cells: (null | { day: number; dateStr: string; available: boolean; price: number; isPast: boolean; isCheckIn: boolean; isCheckOut: boolean; isInRange: boolean })[] = [];

  // Empty cells for first week offset
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const info = calendarMap[dateStr];
    const isPast = dateStr < todayStr;
    const available = info ? info.available : true;
    const price = info?.price || 0;

    const isCheckIn = checkIn === dateStr;
    const isCheckOut = checkOut === dateStr;
    let isInRange = false;
    if (checkIn && checkOut && dateStr > checkIn && dateStr < checkOut) {
      isInRange = true;
    }

    cells.push({ day: d, dateStr, available: available && !isPast, price, isPast, isCheckIn, isCheckOut, isInRange });
  }

  return (
    <div className="mb-4">
      <div className="rounded-xl p-1">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className="p-1.5 rounded-lg hover:bg-sand-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-ocean-500">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-sand-100 transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-ocean-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs text-sand-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const { day, dateStr, available, price, isPast, isCheckIn, isCheckOut, isInRange } = cell;

            const ariaLabel = `${MONTHS[viewMonth]} ${day}, ${viewYear}${
              isCheckIn ? " — check-in" : isCheckOut ? " — check-out" : ""
            }${!available ? ", unavailable" : price > 0 ? `, $${price} per night` : ""}`;

            return (
              <button
                key={dateStr}
                disabled={!available}
                onClick={() => available && onDateSelect?.(dateStr)}
                aria-label={ariaLabel}
                aria-selected={isCheckIn || isCheckOut}
                className={`aspect-square flex flex-col items-center justify-center text-xs rounded-lg transition-all relative ${
                  isCheckIn || isCheckOut
                    ? "bg-ocean-500 text-white font-semibold"
                    : isInRange
                    ? "bg-ocean-100 text-ocean-700"
                    : available
                    ? "hover:bg-sand-100 text-ocean-600 cursor-pointer"
                    : isPast
                    ? "text-sand-300 cursor-default"
                    : "text-sand-300 bg-sand-100/50 cursor-default line-through"
                }`}
              >
                <span className={`${isCheckIn || isCheckOut ? "text-sm" : "text-xs"}`}>{day}</span>
                {available && price > 0 && !isCheckIn && !isCheckOut && (
                  <span className="text-[9px] text-sand-400 mt-0.5">${price}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-sand-100 text-xs text-sand-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-white border border-sand-200" />
            Available
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-sand-100 line-through text-[8px] text-center text-sand-300">x</div>
            Booked
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-ocean-500" />
            Selected
          </div>
        </div>
      </div>
    </div>
  );
}
