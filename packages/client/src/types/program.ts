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