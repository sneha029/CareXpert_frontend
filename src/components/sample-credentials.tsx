import { useState } from "react";

export function SampleCredentials() {
  const [isVisible, _setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div>
    </div>
  );
}
