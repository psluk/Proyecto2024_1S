export const experienceFactors: { label: string; value: string }[] = [
  {
    label: "Nuevo",
    value: "New",
  },
  {
    label: "Existente",
    value: "Existing",
  },
  {
    label: "Impartido antes",
    value: "Taught before",
  },
  {
    label: "Paralelo 1",
    value: "Parallel 1",
  },
  {
    label: "Paralelo 2",
    value: "Parallel 2",
  },
];

export type WorkloadValue =
  | "normal"
  | "extended"
  | "double"
  | "overload"
  | "adHonorem";

export const WorkloadTypes: {
  label: string;
  value: WorkloadValue;
  color: string;
}[] = [
  {
    label: "Normal",
    value: "normal",
    color: "bg-white",
  },
  {
    label: "Ampliación",
    value: "extended",
    color: "bg-orange-200",
  },
  {
    label: "Doble ampliación",
    value: "double",
    color: "bg-blue-200",
  },
  {
    label: "Recargo",
    value: "overload",
    color: "bg-yellow-300",
  },
  {
    label: "Ad honorem",
    value: "adHonorem",
    color: "bg-gray-200",
  },
];
