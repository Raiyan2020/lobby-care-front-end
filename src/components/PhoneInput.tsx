'use client';
import React from 'react';
import { Phone, ChevronDown } from 'lucide-react';
import { Country } from '../api/auth';

interface PhoneInputProps {
  countries: Country[];
  selectedCountry: Country | null;
  onCountryChange: (country: Country) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phone: string) => void;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
}

// @ts-ignore
import { countryCodeEmoji } from 'country-code-emoji';

function getCountryFlag(iso: string): string {
  try {
    return countryCodeEmoji(iso);
  } catch {
    return '🌐';
  }
}

export function PhoneInput({
  countries,
  selectedCountry,
  onCountryChange,
  phoneNumber,
  onPhoneNumberChange,
  disabled = false,
  placeholder = 'XXXXXXXX',
}: PhoneInputProps) {
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const cleaned = e.target.value.replace(/\D/g, '');
    // Limit length based on country metadata, default to 15 if not loaded
    const limit = selectedCountry ? selectedCountry.phone_length : 15;
    onPhoneNumberChange(cleaned.slice(0, limit));
  };

  return (
    <div 
      className="relative flex items-center bg-gray-50 dark:bg-neutral-900/40 border border-gray-200 dark:border-neutral-800 rounded-2xl focus-within:ring-2 focus-within:ring-[var(--store-secondary-color)] focus-within:bg-white dark:focus-within:bg-neutral-900 transition-all overflow-hidden h-12"
      dir="ltr"
      style={{ direction: 'ltr' }}
    >
      {/* Dropdown Container */}
      <div className="relative flex items-center h-full bg-gray-100 dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 text-[#1a1a1a] dark:text-white font-bold text-sm shrink-0 select-none px-3.5 transition-colors">
        <div className="flex items-center gap-1.5 pointer-events-none select-none">
          <span className="text-lg leading-none">{getCountryFlag(selectedCountry?.iso || 'kw')}</span>
          <span className="text-gray-750 dark:text-gray-250 font-sans tracking-wide">{selectedCountry?.code || '+965'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
        </div>
        
        {/* Hidden but clickable native select for great mobile UX & accessibility */}
        <select
          value={selectedCountry?.code || ''}
          onChange={(e) => {
            const found = countries.find((c) => c.code === e.target.value);
            if (found) onCountryChange(found);
          }}
          disabled={disabled || countries.length === 0}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ direction: 'ltr' }}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code} className="text-[#1a1a1a] dark:text-white bg-white dark:bg-neutral-900 font-sans">
              {getCountryFlag(c.iso)} {c.code} ({c.name})
            </option>
          ))}
        </select>
      </div>

      {/* Input Field */}
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneChange}
        disabled={disabled}
        className="w-full h-full px-4 bg-transparent outline-none text-base font-bold text-[#1a1a1a] dark:text-white tracking-widest disabled:opacity-50"
        style={{ direction: 'ltr', textAlign: 'left', unicodeBidi: 'plaintext' }}
      />

      <Phone className="w-5 h-5 text-gray-450 dark:text-gray-550 absolute right-4 pointer-events-none shrink-0" />
    </div>
  );
}
