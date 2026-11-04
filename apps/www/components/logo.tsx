import { cn } from "@/lib/utils";

// The Mireye lockup for the docs: the logomark (two cut blocks, 27 by 20) and the name in Gilroy, 8px apart. The
// wordmark is not final, so the name is set in type rather than drawn.
export function Lockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-fg", className)}>
      <svg viewBox="0 0 27.1667 20" aria-hidden className="h-4 w-auto" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M8.84329 0C11.3929 0 13.9424 0 16.4921 0C16.4903 3.21956 16.4921 6.43914 16.4972 9.65868C17.6796 8.31596 18.8583 6.97033 20.0332 5.6217C22.3433 5.61668 24.6536 5.61498 26.9637 5.61668C26.9654 8.98668 26.9637 12.3567 26.9586 15.7267C25.766 17.0794 24.5773 18.4351 23.3922 19.7937C21.0821 19.7988 18.7719 19.8005 16.4617 19.7988C16.4634 16.4489 16.4617 13.0989 16.4567 9.74898C13.5245 13.1 10.5887 16.4483 7.64944 19.7937C5.09983 19.7988 2.55023 19.8005 0.000633646 19.7988C-0.00105569 16.5625 0.000633646 13.3263 0.00569231 10.09C2.95368 6.72789 5.89955 3.36461 8.84329 0Z" />
      </svg>
      <span className="font-sans text-body-lg leading-none">Mireye</span>
    </span>
  );
}
