export function PropProjectionBar({ projection, line }) {
  const fill = Math.min(projection / (line * 2), 1);
  const isOver = projection >= line;
  return (
    <div className="pp-proj-bar-track">
      <div
        className="pp-proj-bar-fill"
        style={{
          width: `${fill * 100}%`,
          background: isOver ? 'var(--color-positive)' : 'var(--color-negative)',
        }}
      />
      <span
        className="pp-proj-label"
        style={{ color: isOver ? 'var(--color-positive)' : 'var(--color-negative)' }}
      >
        Proj {projection}
      </span>
    </div>
  );
}
