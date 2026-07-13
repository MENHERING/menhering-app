interface FriendSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FriendSearchInput({ value, onChange }: FriendSearchInputProps) {
  return (
    <label className="shadow-card flex h-12 items-center gap-3 rounded-[14px] bg-white px-4">
      <span className="text-lg leading-7" aria-hidden>
        🔍
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="닉네임 또는 친구 코드 검색"
        className="text-brown-ink placeholder:text-brown-muted min-w-0 flex-1 bg-transparent text-sm leading-5 outline-none"
      />
    </label>
  );
}
