import { Check } from "lucide-react";

export type Step = {
  id: number;
  name: string;
  description: string;
};

interface ProgressStepsProps {
  currentStep: number;
  steps: Step[];
}

export default function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: Simplified progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600">
            Paso {currentStep} de {steps.length}
          </span>
          <span className="text-xs text-slate-500">
            {steps[currentStep - 1]?.name}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full step indicator */}
      <nav aria-label="Progress" className="hidden sm:block">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isUpcoming = currentStep < stepNumber;

            return (
              <li
                key={step.id}
                className={`flex-1 ${index !== steps.length - 1 ? 'pr-6' : ''}`}
              >
                <div className="flex items-center">
                  <div className="flex flex-col items-center flex-shrink-0">
                    {/* Step circle */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                        ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' : ''}
                        ${isCurrent ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg ring-4 ring-indigo-100' : ''}
                        ${isUpcoming ? 'bg-slate-200 text-slate-400' : ''}
                      `}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" strokeWidth={3} />
                      ) : (
                        stepNumber
                      )}
                    </div>

                    {/* Step label */}
                    <div className="mt-3 text-center max-w-[120px]">
                      <p
                        className={`
                          text-sm font-semibold transition-colors duration-300
                          ${isCurrent ? 'text-indigo-700' : ''}
                          ${isCompleted ? 'text-green-700' : ''}
                          ${isUpcoming ? 'text-slate-400' : ''}
                        `}
                      >
                        {step.name}
                      </p>
                      <p
                        className={`
                          text-xs mt-1 transition-colors duration-300
                          ${isCurrent ? 'text-indigo-600' : ''}
                          ${isCompleted ? 'text-green-600' : ''}
                          ${isUpcoming ? 'text-slate-400' : ''}
                        `}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {index !== steps.length - 1 && (
                    <div className="flex-1 flex items-start pt-5 pl-4">
                      <div
                        className={`
                          h-0.5 w-full transition-all duration-500
                          ${isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
                          ${isCurrent ? 'bg-gradient-to-r from-indigo-200 to-slate-200' : ''}
                          ${isUpcoming ? 'bg-slate-200' : ''}
                        `}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
