import type { PublicParticipant } from "@/lib/contracts";

type ParticipantSelectorProps = {
  id: string;
  label: string;
  participants: PublicParticipant[];
  value: string;
  onChange: (value: string) => void;
  valueField: "id" | "slug";
  isLoading?: boolean;
  error?: string;
};

export function ParticipantSelector({
  id,
  label,
  participants,
  value,
  onChange,
  valueField,
  isLoading = false,
  error,
}: ParticipantSelectorProps) {
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isLoading}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <option value="">
          {isLoading ? "Carregando nomes..." : "Selecione uma pessoa"}
        </option>
        {participants.map((participant) => (
          <option
            key={participant.id}
            value={participant[valueField]}
          >
            {participant.name}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
