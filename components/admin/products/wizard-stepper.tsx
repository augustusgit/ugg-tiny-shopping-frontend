import type { WizardProgress } from "@/lib/types/products";

export function WizardStepper({
  progress,
  activeStep,
}: {
  progress?: WizardProgress | null;
  activeStep: 1 | 2 | 3;
}) {
  const steps =
    progress?.steps?.length === 3
      ? progress.steps
      : [
          { step: 1, label: "Product Creation", completed: false, current: activeStep === 1 },
          { step: 2, label: "Inventory Creation", completed: false, current: activeStep === 2 },
          { step: 3, label: "Review and Submission", completed: false, current: activeStep === 3 },
        ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          Step {activeStep} of {progress?.total_steps ?? 3}
        </span>
        <span>{progress?.percent ?? 0}% complete</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{
            width: `${Math.max(
              progress?.percent ?? 0,
              activeStep === 1 ? 10 : activeStep === 2 ? 45 : 80,
            )}%`,
          }}
        />
      </div>
      <ol className="grid gap-2 sm:grid-cols-3">
        {steps.map((step) => {
          const isActive = step.step === activeStep;
          return (
            <li
              key={step.step}
              className={`rounded-md border px-3 py-2 text-sm ${
                isActive
                  ? "border-brand bg-brand-soft text-brand"
                  : step.completed
                    ? "border-border text-foreground"
                    : "border-border/60 text-muted"
              }`}
            >
              <span className="text-xs uppercase tracking-[0.12em]">
                Step {step.step}
              </span>
              <p className="mt-0.5 font-medium">{step.label}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
