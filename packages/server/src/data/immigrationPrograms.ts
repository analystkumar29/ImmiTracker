export interface ProcessingTimes {
  exampleCountries?: Record<string, string>;
  inCanada?: string;
}

export interface ImmigrationProgram {
  id: string;
  programName: string;
  category: 'Temporary Residence' | 'Permanent Residence';
  description: string;
  visaOffices: string;
  milestoneUpdates: string[];
  processingTimes: ProcessingTimes;
}

export const immigrationPrograms: ImmigrationProgram[] = [
  {
    id: "visitor_visa",
    programName: "Visitor Visa (TRV)",
    category: "Temporary Residence",
    description: "Allows foreign nationals from visa-required countries to visit Canada temporarily for tourism, family visits, or business.",
    visaOffices: "Processed at regional visa offices (e.g., New Delhi, Manila, London) or via VACs; inside Canada, processed by CPC Ottawa.",
    milestoneUpdates: [
      "Application Submission",
      "Biometrics Instruction Letter (if required)",
      "Biometrics Completion",
      "Additional Document Request/Interview (if applicable)",
      "Passport Request for Visa Stamping",
      "Final Decision"
    ],
    processingTimes: {
      exampleCountries: {
        "India": "114 days",
        "USA": "26 days",
        "Pakistan": "15 days",
        "Philippines": "14 days"
      },
      inCanada: "3 weeks"
    }
  },
  {
    "id": "study_permit",
    "programName": "Study Permit",
    "category": "Temporary Residence",
    "description": "Permits international students to study at designated learning institutions in Canada.",
    "visaOffices": "Processed at regional visa offices worldwide and at the Student Direct Stream for eligible countries.",
    "milestoneUpdates": [
      "Application Submitted",
      "Biometrics Instruction Letter Received",
      "Biometrics Completed",
      "Additional Documents Requested",
      "Additional Documents Submitted",
      "Medical Exam Required",
      "Medical Exam Completed",
      "Decision Made"
    ],
    "processingTimes": {
      "exampleCountries": {
        "India": "8 weeks",
        "China": "8 weeks",
        "Philippines": "8 weeks",
        "Vietnam": "8 weeks"
      }
    }
  },
  {
    "id": "work_permit",
    "programName": "Work Permit",
    "category": "Temporary Residence",
    "description": "Allows foreign nationals to work temporarily in Canada with a valid job offer.",
    "visaOffices": "Processed at regional visa offices worldwide and at IRCC offices within Canada.",
    "milestoneUpdates": [
      "Application Submitted",
      "Biometrics Instruction Letter Received",
      "Biometrics Completed",
      "Additional Documents Requested",
      "Additional Documents Submitted",
      "Medical Exam Required",
      "Medical Exam Completed",
      "Decision Made"
    ],
    "processingTimes": {
      "exampleCountries": {
        "India": "12 weeks",
        "Philippines": "8 weeks",
        "Mexico": "6 weeks"
      },
      "inCanada": "4 weeks"
    }
  },
  {
    "id": "express_entry",
    "programName": "Express Entry",
    "category": "Permanent Residence",
    "description": "Federal skilled worker program for permanent residence in Canada.",
    "visaOffices": "Centrally processed by IRCC.",
    "milestoneUpdates": [
      "Profile Created",
      "ITA Received",
      "Application Submitted",
      "AOR Received",
      "Biometrics Instruction Letter Received",
      "Biometrics Completed",
      "Medical Exam Required",
      "Medical Exam Completed",
      "Additional Documents Requested",
      "Additional Documents Submitted",
      "COPR Issued"
    ],
    "processingTimes": {
      "exampleCountries": {
        "Global": "6 months"
      }
    }
  },
  {
    "id": "pnp",
    "programName": "Provincial Nominee Program",
    "category": "Permanent Residence",
    "description": "Provincial immigration programs for permanent residence in specific Canadian provinces.",
    "visaOffices": "Initially processed by provinces, then by IRCC.",
    "milestoneUpdates": [
      "Provincial Application Submitted",
      "Nomination Certificate Received",
      "Federal Application Submitted",
      "AOR Received",
      "Biometrics Instruction Letter Received",
      "Biometrics Completed",
      "Medical Exam Required",
      "Medical Exam Completed",
      "Additional Documents Requested",
      "Additional Documents Submitted",
      "COPR Issued"
    ],
    "processingTimes": {
      "exampleCountries": {
        "Global": "12-16 months"
      }
    }
  },
  {
    id: "family_sponsorship",
    programName: "Family Sponsorship",
    category: "Permanent Residence",
    description: "Immigration programs for Canadian citizens and permanent residents to sponsor their family members.",
    visaOffices: "Processed at Case Processing Centre in Mississauga (CPC-M) or regional visa offices.",
    milestoneUpdates: [
      "Sponsorship Application Submitted",
      "Sponsorship Approval",
      "Main Application Submitted",
      "AOR Received",
      "Biometrics Instruction Letter Received",
      "Biometrics Completed",
      "Medical Exam Required",
      "Medical Exam Completed",
      "Background Check Initiated",
      "Background Check Completed",
      "Additional Documents Requested",
      "Additional Documents Submitted",
      "Interview (if required)",
      "COPR Issued"
    ],
    processingTimes: {
      exampleCountries: {
        "Global (Spouse/Partner)": "12 months",
        "Global (Parents/Grandparents)": "24 months",
        "Global (Dependent Children)": "12 months"
      },
      inCanada: "12 months"
    }
  }
]; 