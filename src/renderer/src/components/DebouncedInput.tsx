import { useState, useEffect } from "react";

type Props = {
  initialValue: string | null;
  onChange: (value: string | null, id: number | null) => void;
  id: number | null;
};

function DebouncedInput({
  initialValue,
  onChange,
  id,
}: Props): React.ReactElement {
  const [value, setValue] = useState<string | null>(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value, id);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      type="text"
      value={value?.toString() ?? "Sin asignar"}
      onChange={(e) => setValue(e.target.value)}
      className="w-28 rounded-md border border-blue-500/70 bg-white p-1 text-center text-sm text-black focus:border-blue-500 focus:ring-blue-500 transition"
    />
  );
}

export default DebouncedInput;
