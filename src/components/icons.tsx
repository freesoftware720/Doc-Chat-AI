import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="32" height="32" rx="8" fill="hsl(var(--primary))"/>
      <path d="M9 10C9 9.44771 9.44771 9 10 9H22C22.5523 9 23 9.44771 23 10V18C23 18.5523 22.5523 19 22 19H13.6599C13.2845 19 12.9254 19.1979 12.7153 19.5L9.71531 23.5C9.4312 23.8756 9 23.6457 9 23.2141V10Z" fill="white"/>
    </svg>
  );
}
