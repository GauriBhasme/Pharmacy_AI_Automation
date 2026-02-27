export default function Badge({ label, color }) {
  return (
    <span
      style={{
        background: color,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        color: "white",
      }}
    >
      {label}
    </span>
  );
}