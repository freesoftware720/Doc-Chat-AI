import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
      </defs>
      <path
        d="M26 14.5C26 19.4706 21.4706 24 16.5 24C15.4323 24 14.4189 23.8311 13.5 23.5284C10.7431 24.5855 7.5 26 7.5 26C8.5 23.5 8.08333 21.0833 8.02843 20.5284C6.67131 18.9189 6 16.8277 6 14.5C6 9.52944 10.5294 5 16.5 5C21.9706 5 26 9.52944 26 14.5Z"
        fill="url(#logo-gradient)"
      />
    </svg>
  );
}
