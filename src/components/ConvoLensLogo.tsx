interface ConvoLensLogoProps {
  className?: string;
  size?: number;
}

export const ConvoLensLogo = ({ className = "", size = 28 }: ConvoLensLogoProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 4 L36 32 L4 32 Z"
        stroke="hsl(var(--foreground))"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="0" y1="20" x2="14" y2="20" stroke="hsl(var(--text-low))" strokeWidth="1.5" />
      <line x1="26" y1="20" x2="40" y2="14" stroke="hsl(var(--lens-cyan))" strokeWidth="1.5" />
      <line x1="26" y1="20" x2="40" y2="20" stroke="hsl(var(--lens-magenta))" strokeWidth="1.5" />
      <line x1="26" y1="20" x2="40" y2="26" stroke="hsl(var(--lens-amber))" strokeWidth="1.5" />
    </svg>
  );
};
