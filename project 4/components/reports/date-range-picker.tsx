"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, setYear } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateRangeChange?: (range: DateRange | undefined) => void;
  onQuickSelectChange?: (quick: string) => void;
}

export function DateRangePicker({
  className,
  onDateRangeChange,
  onQuickSelectChange,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: new Date(),
  });

  const [quickSelect, setQuickSelect] = React.useState<string>("custom");
  const currentYear = new Date().getFullYear();
  const minYear = 2010;
  const maxYear = currentYear + 1;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  const [selectedYear, setSelectedYear] = React.useState<number | undefined>(undefined);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    onDateRangeChange?.(newDate);
    if (newDate?.from && newDate?.to) {
      const fromYear = newDate.from.getFullYear();
      const toYear = newDate.to.getFullYear();
      if (fromYear === toYear) {
        setSelectedYear(fromYear);
      } else {
        setSelectedYear(undefined);
      }
    }
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    const from = new Date(year, 0, 1);
    const to = new Date(year, 11, 31);
    const newRange = { from, to };
    setDate(newRange);
    onDateRangeChange?.(newRange);
    setQuickSelect("custom");
  };

  const handleQuickSelect = (value: string) => {
    setQuickSelect(value);
    onQuickSelectChange?.(value);
    const today = new Date();

    switch (value) {
      case "today":
        handleDateChange({
          from: startOfDay(today),
          to: endOfDay(today),
        });
        break;
      case "week":
        handleDateChange({
          from: startOfWeek(today, { locale: es }),
          to: endOfWeek(today, { locale: es }),
        });
        break;
      case "month":
        handleDateChange({
          from: startOfMonth(today),
          to: endOfMonth(today),
        });
        break;
      case "custom":
        // No hacer nada, permitir selección manual
        break;
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: es })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: es })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: es })
              )
            ) : (
              <span>Selecciona un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">Año:</span>
            <Select value={selectedYear ? String(selectedYear) : undefined} onValueChange={v => handleYearSelect(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="p-3 border-b">
            <Select value={quickSelect} onValueChange={handleQuickSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            locale={es}
            disabled={quickSelect !== "custom"}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}