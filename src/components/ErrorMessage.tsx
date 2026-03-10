import "./ErrorMessage.css";

interface ErrorMessageProps {
	message: string;
	onRetry: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
	return (
		<div className="error">
			<p>Error: {message}</p>
			<button type="button" onClick={onRetry}>
				Try Again
			</button>
		</div>
	);
}
