// password are base64 so that some smarty student can't just read the source
// code to get all of the answer, at least he/she has to learn about base64.

export interface CaseData {
  password: string;
  facts: string[];
  images?: string[];
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
  {
    password: "c3VyZjE0",
    facts: ["His name is Nathan", "He is born on the 14 Avril 2005"],
    images: ["/assets/nathan.jpg"],
  },
  {
    password: "aG9ja2V5MTA=",
    facts: [
      "Her name is Jessica",
      "She plays hockey",
      "She was state champion year 10!",
    ],
  },
  {
    password: "U21va2VZ",
    facts: [
      "Elsa has a cat called Smokey",
      "She is in year 5",
      "She was born in New Zealand",
    ],
  },
];
