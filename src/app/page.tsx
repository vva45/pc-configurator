import { Suspense } from "react";
import Configurator from "@/components/configurator/Configurator";

/* useSearchParams exige un límite de Suspense al prerenderizar. */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <Configurator />
    </Suspense>
  );
}
