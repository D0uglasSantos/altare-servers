import { Spinner } from "@/components/ui/spinner";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primary/10">
      <Spinner className="w-10 h-10 text-primary" />
      <div className="text-center">
        <p className="mt-4 text-lg font-medium text-primary">Carregando...</p>
      </div>
    </div>
  );
}
