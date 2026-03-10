import "./Loading.css";

export function Loading() {
	return (
		<div className="loading">
			<div className="spinner" />
			<p>Analyzing database...</p>
		</div>
	);
}
