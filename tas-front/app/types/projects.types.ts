export interface Project {
  id: number;
  title: string;
  description: string;
  domain: string | null;

  complexity: 'LOW' | 'MEDIUM' | 'HIGH';

  teamSize: number;
  raised: number;
  deadLine: string;
  durationMonths: number;
  budget: number;

  studentGpaAvg: number | null;
  supervisorExperience: number;

  hasDataset: boolean | null;
  priorSimilarProjects: number;

  milestonesCompleted: number | null;
  successLabel: boolean | null;

  trlLevel: number;
  hasPatents: boolean;
  hasTechnicalDoc: boolean;
  hasVideoPitch: boolean;

  hasMarketStudy: boolean;
  hasMonetizationModel: boolean;

  sector: number;

  hasDirectCompetitors: boolean;

  projectedRaisedAmount: number | null;
  feasibilityIndex: number | null;
  transparencyIndex: number | null;
  communityValidationScore: number | null;

  ownerId: number;

  createdAt: string;
  updatedAt: string;

  isFavorite?: boolean;
}