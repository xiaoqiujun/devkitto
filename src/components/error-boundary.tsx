import { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from "react-error-boundary";

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div role="alert" style={{ padding: 16 }}>
      <h4>Something went wrong:(</h4>

      <pre>{error.message}</pre>

      <details title="Error Stack">
        <summary>Error Stack</summary>
        <pre>{error.stack}</pre>
      </details>
    </div>
  );
}

interface Props {
  children?: ReactNode;
}

export const ErrorBoundary = (props: Props) => {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {props.children}
    </ReactErrorBoundary>
  );
};