export interface ImmigrationSubtype {
  name: string;
}

export interface ImmigrationType {
  type: string;
  subtypes: string[];
}

export const immigrationPrograms: ImmigrationType[] = [
  {
    type: "Temporary Residence",
    subtypes: [
      "Visitor Visa (from outside Canada)",
      "Visitor Visa (from inside Canada)",
      "Visitor Extension (Visitor Record)",
      "Super Visa (Parents or Grandparents)",
      "Study Permit (from outside Canada)",
      "Study Permit (from inside Canada)",
      "Study Permit Extension",
      "Work Permit (from outside Canada)",
      "Work Permit (from inside Canada - initial and extensions)",
      "Seasonal Agricultural Worker Program (SAWP)",
      "International Experience Class (IEC)",
      "Electronic Travel Authorization (ETA)"
    ]
  },
  {
    type: "Economic Immigration",
    subtypes: [
      "Atlantic Immigration Program",
      "Canadian Experience Class",
      "Caregivers",
      "Provincial Nominees",
      "Self-Employed Persons (Federal)",
      "Quebec Business Class",
      "Skilled Workers (Federal)",
      "Skilled Trades (Federal)",
      "Skilled Workers (Quebec)",
      "Start-up Visa"
    ]
  },
  {
    type: "Family Sponsorship",
    subtypes: [
      "Spouse or Common-Law Partner (Living inside Canada)",
      "Spouse, Common-Law or Conjugal Partner (Living outside Canada)",
      "Dependent Child",
      "Parents or Grandparents",
      "Adopted Child or Other Relative"
    ]
  },
  {
    type: "Refugees",
    subtypes: [
      "Government Assisted Refugees",
      "Privately Sponsored Refugees",
      "Protected Person and Convention Refugees in Canada",
      "Dependent of Protected Persons"
    ]
  },
  {
    type: "Humanitarian and Compassionate Cases",
    subtypes: []
  },
  {
    type: "Passport",
    subtypes: []
  },
  {
    type: "Citizenship",
    subtypes: []
  },
  {
    type: "Permanent Resident Card",
    subtypes: []
  },
  {
    type: "Replacing or Amending Documents Verifying Status",
    subtypes: []
  }
];

export const getImmigrationTypes = (): string[] => {
  return immigrationPrograms.map(program => program.type);
};

export const getSubtypesByType = (type: string): string[] => {
  const program = immigrationPrograms.find(p => p.type === type);
  return program?.subtypes || [];
}; 