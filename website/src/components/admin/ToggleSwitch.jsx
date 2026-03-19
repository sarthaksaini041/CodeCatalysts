export default function ToggleSwitch({
  checked,
  onChange,
  label,
  hint,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`admin-switch${checked ? ' is-active' : ''}`}
    >
      <span className="admin-switch-track">
        <span className="admin-switch-thumb" />
      </span>
      <span className="admin-switch-copy">
        <span className="admin-switch-label">{label}</span>
        {hint ? <span className="admin-switch-hint">{hint}</span> : null}
      </span>
    </button>
  );
}
