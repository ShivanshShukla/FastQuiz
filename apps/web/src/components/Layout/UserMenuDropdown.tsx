import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Settings,
  ChevronRight,
  Puzzle,
  Palette,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { UserAvatar } from "../Common/UserAvatar";
import { TroubleshootingModal } from "../Common/TroubleshootingModal";

export const UserMenuDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    showToast("Signed out successfully.", "info");
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate("/curriculum");
  };

  const handleNotificationsClick = () => {
    setActiveItem("notifications");
    showToast("You're all caught up! No unread diagnostic notices.", "info");
    // Keep open or close smoothly
  };

  const handleAccountClick = () => {
    setIsOpen(false);
    navigate("/settings/connections");
  };

  const handleTroubleshootingClick = () => {
    setIsOpen(false);
    setShowTroubleshooting(true);
  };

  return (
    <>
      <div className="relative inline-block text-left" ref={menuRef}>
        {/* User Pill Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="User account menu"
          className={`flex items-center gap-2.5 p-1.5 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isOpen
              ? "bg-zinc-100 dark:bg-zinc-800/90 border-zinc-300 dark:border-zinc-700 shadow-sm"
              : "border-transparent hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60"
          }`}
        >
          <UserAvatar src={user.avatarUrl} name={user.name} size="md" />
          <div className="hidden xl:flex flex-col text-left min-w-0 pr-1">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none truncate max-w-[120px]">
              {user.name}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5 truncate max-w-[120px]">
              {user.tierTitle || "Scholar"}
            </span>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-zinc-700 dark:text-zinc-200" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown Floating Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-[#18181b] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left text-zinc-800 dark:text-zinc-200">
            {/* User Profile Header Card */}
            <div className="p-2.5 mb-1 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/70 flex items-center gap-3">
              <UserAvatar src={user.avatarUrl} name={user.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user.name}
                  </p>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800/50">
                    {user.tierTitle || "Scholar"}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {user.email || "engineer@fastquiz.dev"}
                </p>
              </div>
            </div>

            {/* Menu Items matching the user screenshot */}
            <div className="space-y-0.5">
              {/* Profile */}
              <button
                type="button"
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <User
                  className="w-4 h-4 text-zinc-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Profile</span>
              </button>

              {/* Notifications */}
              <button
                type="button"
                onClick={handleNotificationsClick}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                  activeItem === "notifications"
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold"
                    : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell
                    className="w-4 h-4 text-zinc-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Notifications</span>
                </div>
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                  title="All caught up"
                />
              </button>

              {/* Account */}
              <button
                type="button"
                onClick={handleAccountClick}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <div className="flex items-center gap-3">
                  <Settings
                    className="w-4 h-4 text-zinc-400 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Account</span>
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5 text-zinc-400 shrink-0"
                  aria-hidden="true"
                />
              </button>

              {/* Troubleshooting */}
              <button
                type="button"
                onClick={handleTroubleshootingClick}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <Puzzle
                  className="w-4 h-4 text-zinc-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Troubleshooting</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="my-1.5 border-t border-zinc-200/80 dark:border-zinc-800/80" />

            {/* Theme Toggle with sliding pill knob (matching screenshot) */}
            <div
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <Palette
                  className="w-4 h-4 text-zinc-400 shrink-0"
                  aria-hidden="true"
                />
                <span>Theme</span>
              </div>

              {/* Sliding Pill Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={theme === "dark"}
                aria-label={`Toggle theme (currently ${theme})`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={`w-14 h-7 rounded-full p-0.5 flex items-center transition-colors cursor-pointer border ${
                  theme === "dark"
                    ? "bg-zinc-800/90 border-zinc-700 justify-end"
                    : "bg-zinc-200 border-zinc-300 justify-start"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-all ${
                    theme === "dark"
                      ? "bg-zinc-950 text-white"
                      : "bg-white text-zinc-800"
                  }`}
                >
                  {theme === "dark" ? (
                    <Moon
                      className="w-3 h-3 text-white fill-current"
                      aria-hidden="true"
                    />
                  ) : (
                    <Sun
                      className="w-3 h-3 text-amber-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="my-1.5 border-t border-zinc-200/80 dark:border-zinc-800/80" />

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
            >
              <LogOut
                className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0"
                aria-hidden="true"
              />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Diagnostics / Troubleshooting Modal */}
      <TroubleshootingModal
        isOpen={showTroubleshooting}
        onClose={() => setShowTroubleshooting(false)}
      />
    </>
  );
};
