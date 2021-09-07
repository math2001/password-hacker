// password are base64 so that some smarty student can't just read the source
// code to get all of the answer, at least he/she has to learn about base64.

export type Facts = string[];
export interface CaseData {
  password: string;
  facts: Facts;
}

export const database: CaseData[] = [
  {
    password: "anVsaWUxMQ==",
    facts: [
      "Her name is Julie Williams.",
      "Lives in Perth, Western Australia.",
      "She has a dog, called Max.",
      "She is born on 12 February 2011.",
    ],
  },
  {
    password: "c2VjcmV0",
    facts: [
      "His name is Andrew",
      "He lives in Sydney, Australia",
      "He loves riding his mountain bike",
      "He has 2 brothers",
    ],
  },
];
