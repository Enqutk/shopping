interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="arctic-card p-8 text-center max-w-md mx-auto"
      role="alert"
    >
      <h2 className="text-sm font-bold uppercase tracking-widest text-arctic-deep">{title}</h2>
      <p className="text-sm text-arctic-deep/60 mt-2 normal-case tracking-normal">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary mt-6">
          Try again
        </button>
      )}
    </div>
  );
}
