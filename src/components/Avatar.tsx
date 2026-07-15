export function Avatar({
  name,
  avatarUrl,
  size = "h-10 w-10",
  textSize = "text-base",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: string;
  textSize?: string;
}) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-brand-gradient ${textSize} font-bold text-white`}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
}
