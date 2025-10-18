// src/data/geo.ts
export const CASTE_OPTIONS = [
  'SC',
  'ST',
  'OBC',
  'BC-A',
  'BC-B',
  'BC-C',
  'BC-D',
  'BC-E',
  'EWS',
  'OC',
] as const;

export const GENDER_OPTIONS = ['male', 'female'] as const;

// Keep this compact; extend as needed
export const STATES = [
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'TS', name: 'Telangana' },
  { code: 'KA', name: 'Karnataka' },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'MH', name: 'Maharashtra' },
  { code: 'DL', name: 'Delhi (NCT)' },
] as const;

// Minimal example mapping; add full list later
export const DISTRICTS_BY_STATE: Record<string, { code: string; name: string }[]> = {
  AP: [
    { code: 'VSP', name: 'Visakhapatnam' },
    { code: 'EG', name: 'East Godavari' },
  ],
  TS: [
    { code: 'HYD', name: 'Hyderabad' },
    { code: 'RNG', name: 'Rangareddy' },
  ],
  KA: [{ code: 'BLR', name: 'Bengaluru Urban' }],
  TN: [{ code: 'CHE', name: 'Chennai' }],
  MH: [{ code: 'MUM', name: 'Mumbai' }],
  DL: [{ code: 'ND', name: 'New Delhi' }],
};

// You can revise these to your admin-defined partitions later
export const STATE_ZONES = ['North', 'South', 'East', 'West', 'Central', 'North-East'] as const;

export const CENTRAL_ZONES = ['Central Zone A', 'Central Zone B', 'Central Zone C'] as const;
