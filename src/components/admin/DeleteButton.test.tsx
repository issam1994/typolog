import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteButton from "./DeleteButton";

beforeEach(() => vi.restoreAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("DeleteButton", () => {
  it("submits the action (with the id) when the user confirms", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const action = vi.fn();
    const user = userEvent.setup();
    render(<DeleteButton id="q1" action={action} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const formData = action.mock.calls[0][0] as FormData;
    expect(formData.get("id")).toBe("q1");
  });

  it("does not submit when the user cancels the confirm", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const action = vi.fn();
    const user = userEvent.setup();
    render(<DeleteButton id="q1" action={action} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalled();
    expect(action).not.toHaveBeenCalled();
  });
});
