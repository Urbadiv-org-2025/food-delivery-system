import { Input } from "@/components/ui/input";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

export const TimePicker = ({ value, onChange }: TimePickerProps) => {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
      required
    />
  );
};
