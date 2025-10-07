import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface ErrorAlertProps {
  readonly message: string;
  readonly type?: "error" | "warning" | "info" | "success";
  readonly className?: string;
}

export function ErrorAlert({ message, type = "error", className = "" }: ErrorAlertProps) {
  const icons = {
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
  };

  const colors = {
    error: "text-red-700 dark:text-red-300 bg-gradient-to-r from-red-50 to-red-100/80 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700/50",
    warning: "text-yellow-700 dark:text-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100/80 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700/50",
    info: "text-blue-700 dark:text-blue-300 bg-gradient-to-r from-blue-50 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50",
    success: "text-green-700 dark:text-green-300 bg-gradient-to-r from-green-50 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700/50",
  };

  const Icon = icons[type];

  return (
    <div
      className={`flex items-center p-4 border rounded-xl backdrop-blur-sm shadow-sm ${colors[type]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}
