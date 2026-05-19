"use client";

export default function DeleteButton({
  id,
  action,
}: {
  id: string;
  action: (f: FormData) => void;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm("Delete this question? It will be hidden from the quiz.")
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs text-danger hover:text-danger/80 transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
