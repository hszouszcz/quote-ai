import { render as rtlRender } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

function render(ui: ReactElement, options = {}) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, {
      ...options,
    }),
  };
}

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { render };
