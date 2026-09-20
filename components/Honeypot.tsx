"use client";

/**
 * An invisible field that only bots fill in. Real users never see or tab
 * into it (aria-hidden, tabIndex -1, positioned off-screen rather than
 * display:none, since some bots skip display:none fields). Pass its value
 * to the server and reject the submission if it's non-empty.
 */
export default function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      <label htmlFor="website">Website</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
