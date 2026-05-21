"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

export interface DateTimePickerProps {
  value?: Date | null
  onChange?: (date: Date | null) => void
  includeTime?: boolean
  timeOnly?: boolean
  minDate?: Date | string
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  includeTime = false,
  timeOnly = false,
  minDate,
  disabled,
  placeholder = "Pilih tanggal",
  className
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value || undefined)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setDate(value || undefined)
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined)
      onChange?.(null)
      return
    }
    
    if (includeTime && date) {
      selectedDate.setHours(date.getHours())
      selectedDate.setMinutes(date.getMinutes())
      selectedDate.setSeconds(0)
    } else if (includeTime && !date) {
        const now = new Date()
        selectedDate.setHours(now.getHours())
        selectedDate.setMinutes(now.getMinutes())
        selectedDate.setSeconds(0)
    }

    setDate(selectedDate)
    onChange?.(selectedDate)
    
    if (!includeTime) {
      setIsOpen(false)
    }
  }

  const handleTimeChange = (type: 'hour' | 'minute', val: string) => {
    const newDate = date ? new Date(date) : new Date()
    if (type === 'hour') {
      newDate.setHours(parseInt(val, 10))
    } else {
      newDate.setMinutes(parseInt(val, 10))
    }
    newDate.setSeconds(0)
    
    setDate(newDate)
    onChange?.(newDate)
  }

  const setToday = () => {
    const now = new Date()
    setDate(now)
    onChange?.(now)
    setIsOpen(false)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  if (timeOnly) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Select
          value={date ? date.getHours().toString().padStart(2, '0') : ""}
          onValueChange={(val) => handleTimeChange('hour', val)}
          disabled={disabled}
        >
          <SelectTrigger className="w-[70px] h-10 bg-background rounded-lg">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {hours.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-bold text-muted-foreground">:</span>
        <Select
          value={date ? date.getMinutes().toString().padStart(2, '0') : ""}
          onValueChange={(val) => handleTimeChange('minute', val)}
          disabled={disabled}
        >
          <SelectTrigger className="w-[70px] h-10 bg-background rounded-lg">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-background border-input h-10 rounded-lg",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {date ? format(date, includeTime ? "PPP HH:mm" : "PPP", { locale: id }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[100]" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(d) => {
              if (disabled) return true
              if (minDate && d.getTime() < new Date(minDate).setHours(0,0,0,0)) return true
              return false
          }}

          locale={id}
        />
        {includeTime && (
          <div className="p-3 border-t border-border/50 flex items-center justify-between bg-muted/10">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Waktu
            </span>
            <div className="flex items-center gap-1">
              <Select
                value={date ? date.getHours().toString().padStart(2, '0') : "00"}
                onValueChange={(val) => handleTimeChange('hour', val)}
              >
                <SelectTrigger className="w-[65px] h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {hours.map((h) => (
                    <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="font-bold text-muted-foreground">:</span>
              <Select
                value={date ? date.getMinutes().toString().padStart(2, '0') : "00"}
                onValueChange={(val) => handleTimeChange('minute', val)}
              >
                <SelectTrigger className="w-[65px] h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {minutes.map((m) => (
                    <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="p-2 border-t border-border/50 bg-muted/20">
          <Button
            variant="ghost"
            className="w-full h-8 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 transition-colors rounded-md"
            onClick={setToday}
          >
            Pilih Waktu Saat Ini
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TimePicker({
  value,
  onChange,
  disabled,
  className
}: {
  value?: string
  onChange?: (val: string) => void
  disabled?: boolean
  className?: string
}) {
  const [hour, min] = (value || "00:00").split(":")
  
  const handleTimeChange = (type: 'hour' | 'minute', val: string) => {
    let newH = hour || "00"
    let newM = min || "00"
    if (type === 'hour') newH = val
    else newM = val
    onChange?.(`${newH}:${newM}`)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Select value={hour} onValueChange={(val) => handleTimeChange('hour', val)} disabled={disabled}>
        <SelectTrigger className="w-[65px] h-11 bg-background rounded-xl">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {hours.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
        </SelectContent>
      </Select>
      <span className="font-bold text-muted-foreground">:</span>
      <Select value={min} onValueChange={(val) => handleTimeChange('minute', val)} disabled={disabled}>
        <SelectTrigger className="w-[65px] h-11 bg-background rounded-xl">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          {minutes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
