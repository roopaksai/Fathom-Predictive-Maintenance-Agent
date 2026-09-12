import { PageHeader } from "@/components/deck/PageHeader";
import { InputTheater } from "@/components/analyze/InputTheater";
import { ResultStage } from "@/components/analyze/ResultStage";

export function Analyze() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="02 / Analyze"
        title="Machine analysis workspace"
        description="Shape the telemetry scenario, run the assessment, and read the verdict back from the model."
      />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <InputTheater />
        </div>
        <div className="lg:col-span-5">
          <ResultStage />
        </div>
      </div>
    </div>
  );
}