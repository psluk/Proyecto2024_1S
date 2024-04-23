import { useState, useEffect } from "react";

type Props = {
  initialValue: string | null;
  onChange: (value: string | null, id: number | null) => void;
  id: number | null;
};

function DebouncedInput({ initialValue, onChange, id }: Props) {
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
      className="w-20 rounded-md border-2 border-gray-800 bg-white p-1 text-center text-sm text-black"
    />
  );
}

export default DebouncedInput;
