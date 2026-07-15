// Текст сообщения чата: если внутри есть ссылка — рендерим её отдельной
// кнопкой, а не голым URL-текстом (например, ссылка на закрытый Pro-канал).
const URL_REGEX = /(https?:\/\/\S+)/g;

export function ChatMessageBody({ text }: { text: string }) {
  const parts = text.split(URL_REGEX);

  return (
    <div className="whitespace-pre-line">
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex w-fit items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 py-1.5 text-xs font-medium text-white shadow-glow transition-transform duration-300 hover:scale-105"
          >
            🔗 Открыть ссылку
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </div>
  );
}
