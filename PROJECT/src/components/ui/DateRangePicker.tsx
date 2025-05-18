import { useState } from 'react';
import { format, addDays, isAfter, isBefore, isEqual } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateRangePickerProps {
  onRangeChange: (range: { startDate: Date; endDate: Date }) => void;
  initialRange?: { startDate: Date; endDate: Date };
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onRangeChange, initialRange }) => {
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(initialRange?.startDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialRange?.endDate || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const toggleCalendar = () => setIsOpen(!isOpen);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (isBefore(date, startDate)) {
        setStartDate(date);
        setEndDate(null);
      } else {
        setEndDate(date);
        setIsOpen(false);
        if (startDate) {
          onRangeChange({ startDate, endDate: date });
        }
      }
    }
  };

  const handleHover = (date: Date) => {
    setHoverDate(date);
  };

  const isDateInRange = (date: Date) => {
    if (startDate && !endDate && hoverDate) {
      return (
        (isAfter(date, startDate) && isBefore(date, hoverDate)) ||
        (isAfter(date, hoverDate) && isBefore(date, startDate))
      );
    }
    if (startDate && endDate) {
      return isAfter(date, startDate) && isBefore(date, endDate);
    }
    return false;
  };

  const isStartDate = (date: Date) => startDate && isEqual(date, startDate);
  const isEndDate = (date: Date) => endDate && isEqual(date, endDate);

  const renderDays = () => {
    const days = [];
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

    // Render previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, previousMonth - i);
      days.push(
        <button
          key={`prev-${i}`}
          className="w-10 h-10 text-gray-400 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isBefore(date, today)}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => handleHover(date)}
        >
          {previousMonth - i}
        </button>
      );
    }

    // Render current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isToday = isEqual(date, today);
      
      days.push(
        <button
          key={i}
          className={`w-10 h-10 rounded-full ${
            isStartDate(date) || isEndDate(date)
              ? 'bg-primary-600 text-white'
              : isDateInRange(date)
              ? 'bg-primary-100 text-primary-700'
              : isToday
              ? 'bg-gray-100'
              : 'hover:bg-gray-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={isBefore(date, today)}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => handleHover(date)}
        >
          {i}
        </button>
      );
    }

    // Fill remaining days from next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i);
      days.push(
        <button
          key={`next-${i}`}
          className="w-10 h-10 text-gray-400 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isBefore(date, today)}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => handleHover(date)}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  const displayValue = startDate && endDate
    ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
    : startDate
    ? `${format(startDate, 'MMM d, yyyy')} - Select end date`
    : 'Select dates';

  return (
    <div className="relative">
      <div
        className="flex items-center border border-gray-300 rounded-md p-2 cursor-pointer"
        onClick={toggleCalendar}
      >
        <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
        <span className="text-sm">{displayValue}</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-30 mt-2 bg-white rounded-lg shadow-elegant-lg p-4 w-auto sm:w-[500px] border border-gray-200 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={prevMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h4 className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <button
              onClick={nextMonth}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Next Month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs mb-2">
            <div className="font-medium">Su</div>
            <div className="font-medium">Mo</div>
            <div className="font-medium">Tu</div>
            <div className="font-medium">We</div>
            <div className="font-medium">Th</div>
            <div className="font-medium">Fr</div>
            <div className="font-medium">Sa</div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-sm">
            {renderDays()}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              className="text-sm text-gray-600 hover:text-primary-600"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary-600 font-medium hover:text-primary-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;