interface Group {
  label: string;
  description: string;
  permutants: Array<Permutant>;
  unknowns: Array<{
    label: string;
    value: string;
  }>;
}