// Иконка логотипа — гранёный алмаз в фирменном сине-фиолетовом градиенте
// (заменяет прежнюю абстрактную "нейро"-иконку).
//
// ВАЖНО: id градиента передаётся пропом и должен быть уникальным на странице
// (см. пояснение в прежней NeuroIcon — Safari иначе не рисует градиент,
// если на странице несколько экземпляров с одинаковым id).
export function DiamondIcon({
  className = "h-7 w-7",
  id = "diamond-grad",
}: {
  className?: string;
  id?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#5B4FE0" />
          <stop offset="100%" stopColor="#7C6FF0" />
        </linearGradient>
      </defs>
      <path
        d="M11 6 L21 6 L27 13 L16 29 L5 13 Z"
        fill={`url(#${id})`}
        stroke={`url(#${id})`}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <g stroke="#fff" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round">
        <line x1="5" y1="13" x2="27" y2="13" />
        <line x1="11" y1="6" x2="16" y2="29" />
        <line x1="21" y1="6" x2="16" y2="29" />
      </g>
    </svg>
  );
}
