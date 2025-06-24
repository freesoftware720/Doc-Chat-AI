import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M17.5 11.5C17.5 13.433 15.933 15 14 15H13.25L11 17.25V15H10C8.067 15 6.5 13.433 6.5 11.5C6.5 9.567 8.067 8 10 8H14C15.933 8 17.5 9.567 17.5 11.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
