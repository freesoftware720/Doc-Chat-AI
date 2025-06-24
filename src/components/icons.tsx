import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#6C63FF" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>
      <path
        d="M20 21V11C20 9.89543 19.1046 9 18 9H16.8302C16.4418 9 16.0691 8.84438 15.7955 8.57077L14.4292 7.20451C14.1556 6.9309 13.7829 6.77528 13.3944 6.77528H10C8.89543 6.77528 8 7.67071 8 8.77528V17C8 18.1046 7.10457 19 6 19H4C2.89543 19 2 19.8954 2 21H20Z"
        fill="url(#logo-gradient)"
        fillOpacity="0.3"
      />
      <path
        d="M22 13V19C22 20.1046 21.1046 21 20 21H8C6.89543 21 6 20.1046 6 19V11C6 9.89543 6.89543 9 8 9H15.1707C15.5583 9 15.9302 8.84277 16.2045 8.56848L17.5708 7.2022C17.8451 6.92791 18.217 6.77068 18.6046 6.77068H20C21.1046 6.77068 22 7.67071 22 8.77068V13Z"
        fill="url(#logo-gradient)"
      />
    </svg>
  );
}
