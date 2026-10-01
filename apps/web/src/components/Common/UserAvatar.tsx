import React, { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const isGoogleUserContentHost = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.hostname.toLowerCase() === "lh3.googleusercontent.com";
  } catch {
    return false;
  }
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = "Learner",
  size = "md",
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-xs",
  };

  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  const avatarSrc =
    src && !isGoogleUserContentHost(src)
      ? src
      : "/assets/avatar.png";

  if (hasError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 flex items-center justify-center font-medium text-zinc-700 dark:text-zinc-200 shrink-0 ${className}`}
        aria-label={name}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarSrc}
      alt={name ? `${name}'s profile avatar` : "Candidate profile avatar"}
      onError={() => setHasError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 ${className}`}
    />
  );
};
