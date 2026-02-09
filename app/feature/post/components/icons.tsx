type IconProps = {
  className?: string;
};

export function IconSearch({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M16.5 16.5L21 21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function IconBell({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 8.5c0-3.2 2.6-5.8 6-5.8s6 2.6 6 5.8v4.8l1.4 2.5H4.6L6 13.3V8.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M9.5 19.5c.6 1 1.6 1.5 2.5 1.5s1.9-.5 2.5-1.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function IconPlus({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function IconVideo() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        width="14"
        x="3"
        y="6"
      />
      <path
        d="M17 9l4-2v10l-4-2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function IconImage() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        width="18"
        x="3"
        y="5"
      />
      <path
        d="M7 14l3-3 4 4 3-3 2 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <circle cx="9" cy="9" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function IconSmile() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 14c1.2 1.2 2.7 1.8 4 1.8s2.8-.6 4-1.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconLike() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 10v9h9.5c1.3 0 2.3-1 2.2-2.3l-.6-5.3c-.1-1-1-1.8-2-1.8h-4.3l.7-3.2c.2-1-.6-1.9-1.6-1.9l-1 5.2H7Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M5 10h2v9H5z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function IconComment() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 6h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H10l-4 3v-3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function IconShare() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 5v10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <path
        d="M7 9l5-4 5 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
      <rect
        height="6"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
        width="14"
        x="5"
        y="13"
      />
    </svg>
  );
}
