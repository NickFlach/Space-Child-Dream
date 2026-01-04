import * as React from "react";
import { useId } from "react";

export type SigilField =
  | "aurora"
  | "plasma"
  | "void"
  | "ember"
  | "neon"
  | "bloom";

export interface SigilProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
  field?: SigilField;
  animate?: boolean;
  aura?: boolean;
}

const Sigil = ({
  size = 24,
  strokeWidth = 1.75,
  field = "aurora",
  animate = true,
  aura = false,
  children,
  className,
  ...props
}: SigilProps) => {
  const id = useId();
  const gradientId = `${field}-${id}`;

  const getGradient = () => {
    switch (field) {
      case "aurora":
        return (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7F9" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        );
      case "plasma":
        return (
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        );
      case "void":
        return (
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        );
      case "ember":
        return (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>
        );
      case "neon":
        return (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        );
      case "bloom":
        return (
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor="#F0ABFC" />
            <stop offset="100%" stopColor="#4C1D95" />
          </radialGradient>
        );
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${gradientId})`}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <defs>{getGradient()}</defs>

      {aura && (
        <circle
          cx="12"
          cy="12"
          r="10"
          opacity="0.12"
          fill={`url(#${gradientId})`}
        >
          {animate && (
            <animate
              attributeName="opacity"
              values="0.08;0.18;0.08"
              dur="6s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      )}

      <g>
        {animate && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="60s"
            repeatCount="indefinite"
          />
        )}
        {children}
      </g>
    </svg>
  );
};

export const ArtSigil = (props: SigilProps) => (
  <Sigil field="bloom" aura {...props}>
    <path d="M12 4a8 8 0 1 0 0 16" />
    <path d="M9 9l6 6">
      <animate
        attributeName="stroke-dasharray"
        values="1,12;6,6;1,12"
        dur="4s"
        repeatCount="indefinite"
      />
    </path>
  </Sigil>
);

export const ResearchSigil = (props: SigilProps) => (
  <Sigil field="aurora" aura {...props}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="14" cy="10" r="1">
      <animate
        attributeName="cx"
        values="13;15;13"
        dur="5s"
        repeatCount="indefinite"
      />
    </circle>
  </Sigil>
);

export const FashionSigil = (props: SigilProps) => (
  <Sigil field="plasma" aura {...props}>
    <path d="M12 3c2 4 2 14 0 18">
      <animate
        attributeName="d"
        dur="6s"
        repeatCount="indefinite"
        values="M12 3c2 4 2 14 0 18;M11 3c3 5 3 13 1 18;M12 3c2 4 2 14 0 18"
      />
    </path>
  </Sigil>
);

export const LearningSigil = (props: SigilProps) => (
  <Sigil field="neon" aura {...props}>
    <path d="M6 15l6-8 6 8" />
    <path d="M12 7v10">
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0;0 -1;0 0"
        dur="3s"
        repeatCount="indefinite"
      />
    </path>
  </Sigil>
);

export const InvestingSigil = (props: SigilProps) => (
  <Sigil field="ember" aura {...props}>
    <path d="M5 14c2 4 12 4 14 0" />
    <circle cx="12" cy="9" r="1.5">
      <animate
        attributeName="cy"
        values="9;7;9"
        dur="4s"
        repeatCount="indefinite"
      />
    </circle>
  </Sigil>
);

export const ShoppingSigil = (props: SigilProps) => (
  <Sigil field="plasma" aura {...props}>
    <path d="M5 12c3-3 11-3 14 0" />
    <path d="M5 12c3 3 11 3 14 0" />
  </Sigil>
);

export const DevelopmentSigil = (props: SigilProps) => (
  <Sigil field="neon" aura {...props}>
    <path d="M6 6h10v10" />
    <path d="M6 16h4" />
  </Sigil>
);

export const Web3Sigil = (props: SigilProps) => (
  <Sigil field="void" aura {...props}>
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="12" r="2" />
    <path d="M8 12c2-3 6-3 8 0" strokeDasharray="20">
      <animate
        attributeName="stroke-dashoffset"
        from="20"
        to="0"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
  </Sigil>
);

export const ExperimentalSigil = (props: SigilProps) => (
  <Sigil field="bloom" aura {...props}>
    <circle cx="12" cy="12" r="1.5" />
    <path d="M12 4v4" />
    <path d="M18 12h-4" />
    <path d="M12 20v-4" />
    <path d="M6 12h4" />
  </Sigil>
);

export const HardwareSigil = (props: SigilProps) => (
  <Sigil field="void" aura={false} animate={false} {...props}>
    <path d="M12 4v12" />
    <path d="M6 16c2 4 10 4 12 0" />
    <circle cx="12" cy="4" r="1.5" />
  </Sigil>
);

export const SpaceChildSigils = {
  Art: ArtSigil,
  Research: ResearchSigil,
  Fashion: FashionSigil,
  Learning: LearningSigil,
  Investing: InvestingSigil,
  Shopping: ShoppingSigil,
  Development: DevelopmentSigil,
  Web3: Web3Sigil,
  Experimental: ExperimentalSigil,
  Hardware: HardwareSigil,
};
