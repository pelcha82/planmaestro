import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface CodeInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function CodeInput({ 
  length, 
  value, 
  onChange, 
  disabled = false,
  autoFocus = false 
}: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    // Only allow single digit numbers
    const sanitizedDigit = digit.replace(/\D/g, '').slice(0, 1);
    
    // Build new code value
    const newValue = value.split('');
    newValue[index] = sanitizedDigit;
    const newCode = newValue.join('');
    
    onChange(newCode);

    // Auto-focus next input if digit was entered
    if (sanitizedDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty, delete previous digit and focus it
        const newValue = value.split('');
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current digit
        const newValue = value.split('');
        newValue[index] = '';
        onChange(newValue.join(''));
      }
      e.preventDefault();
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (digits) {
      onChange(digits);
      // Focus the last filled input or the next empty one
      const nextEmptyIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select the content when focused for easy replacement
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {Array.from({ length }, (_, index) => {
        const digit = value[index] || '';
        const isFilled = digit !== '';
        const isComplete = value.length === length;
        
        return (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={`
              w-12 h-14 sm:w-14 sm:h-16 
              text-center text-2xl sm:text-3xl font-bold 
              rounded-lg border-2 
              transition-all duration-200
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isFilled && isComplete
                ? 'border-green-500 bg-green-50 text-green-900 focus:ring-green-500 focus:border-green-500'
                : isFilled
                ? 'border-indigo-400 bg-indigo-50 text-indigo-900 focus:ring-indigo-500 focus:border-indigo-500'
                : 'border-slate-300 bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-400'
              }
            `}
            aria-label={`Dígito ${index + 1}`}
          />
        );
      })}
    </div>
  );
}
