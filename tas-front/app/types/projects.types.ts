export interface AttachmentProject {
  description: string;
  id: number;
  url: string;
  filename: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  resume: string;
  domain: string | null;

  complexity: 'LOW' | 'MEDIUM' | 'HIGH';

  teamSize: number;
  raised: number;
  deadLine: string;
  durationMonths: number;
  budget: number;

  allowFree: boolean;
  tiers: TierProject[];

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

  contributions: Contribution[];

  ownerId: number;

  createdAt: string;
  updatedAt: string;

  isFavorite?: boolean;

  attachments: AttachmentProject[]
}


export interface TierProject {
  id: number;
  amount: number;
  benefit: string;
}

export interface Contribution {
  amount: number;
  createdAt: string;
  user: UserContribution;
}

export interface UserContribution {
  name: string;
}

