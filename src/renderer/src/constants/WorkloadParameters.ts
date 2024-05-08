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
}[] = [
  {
    label: "Normal",
    value: "normal",
  },
  {
    label: "Ampliación",
    value: "extended",
  },
  {
    label: "Doble ampliación",
    value: "double",
  },
  {
    label: "Recargo",
    value: "overload",
  },
  {
    label: "Ad honorem",
    value: "adHonorem",
  },
];
