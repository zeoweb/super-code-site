// Абстрактная "нейро"-иконка: узлы, соединённые линиями, в синем градиенте.
//
// ВАЖНО: id градиента передаётся пропом и должен быть уникальным на странице.
// Если на одной странице рендерится несколько экземпляров с одинаковым id
// (например, скрытый десктопный сайдбар + видимый мобильный хедер), Safari
// может не отрисовать градиент вообще — ссылка url(#id) резолвится в первый
// элемент с таким id в DOM, а не в "свой" локальный.
export function NeuroIcon({
  className = "h-7 w-7",
  id = "neuro-grad",
}: {
  className?: string;
  id?: string;
}) {
  const nodes = [
    { x: 16, y: 4 },
    { x: 5, y: 11 },
    { x: 27, y: 11 },
    { x: 16, y: 16 },
    { x: 6, y: 24 },
    { x: 26, y: 24 },
    { x: 16, y: 29 },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [1, 3], [2, 3],
    [1, 4], [2, 5], [3, 4], [3, 5], [4, 6], [5, 6],
  ];

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="1" opacity="0.7">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
        ))}
      </g>
      <g fill={`url(#${id})`}>
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={i === 3 ? 3 : 2.2} />
        ))}
      </g>
    </svg>
  );
}
