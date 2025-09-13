"use client";

import { CalendarDays } from "lucide-react";

interface DateSelectorProps {
  selectedDates: string[];
  onDateChange: (dates: string[]) => void;
  disabled?: boolean;
}

export default function DateSelector({ 
  selectedDates, 
  onDateChange, 
  disabled = false 
}: DateSelectorProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Start from tomorrow and get next 6 days
    for (let i = 1; i <= 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleDateToggle = (date: string) => {
    if (disabled) return;
    
    const isSelected = selectedDates.includes(date);
    if (isSelected) {
      // Remove date from selection
      onDateChange(selectedDates.filter(d => d !== date));
    } else {
      // Add date to selection
      onDateChange([...selectedDates, date]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <CalendarDays className="w-4 h-4 mr-2 text-gray-600" />
        <h4 className="font-medium text-gray-900">Select Dates</h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableDates.map((date) => {
          const isSelected = selectedDates.includes(date);
          return (
            <button
              key={date}
              onClick={() => handleDateToggle(date)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-sm font-medium">
                {formatDate(date)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDateDisplay(date)}
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <CalendarDays className="w-4 h-4 text-blue-600 mr-2" />
            <p className="font-medium text-blue-800">
              {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((date) => (
              <span
                key={date}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {formatDate(date)}
              </span>
            ))}
          </div>
          <button
            onClick={() => onDateChange([])}
            disabled={disabled}
            className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
          >
            Clear all
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Choose the dates you want to use your seasonal pass (you can select multiple dates)
      </p>
    </div>
  );
}
