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
];
export const GENDER_OPTIONS = ['Male', 'Female'];
export const STATE_OPTIONS = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Maharashtra',
  'Delhi',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
];
export const STATE_ZONE_OPTIONS = ['Zone-1', 'Zone-2', 'Zone-3', 'Zone-4'];
export const CENTRAL_ZONE_OPTIONS = [
  'Central-North',
  'Central-South',
  'Central-East',
  'Central-West',
];

export function districtsForState(state: string): string[] {
  if (state === 'Telangana') {
    return [
      'Adilabad',
      'Bhadradri Kothagudem',
      'Hanumakonda',
      'Hyderabad',
      'Jagtial',
      'Jangaon',
      'Jayashankar Bhupalpally',
      'Jogulamba Gadwal',
      'Kamareddy',
      'Karimnagar',
      'Khammam',
      'Komaram Bheem Asifabad',
      'Mahabubabad',
      'Mahabubnagar',
      'Mancherial',
      'Medak',
      'Medchal–Malkajgiri',
      'Mulugu',
      'Nagarkurnool',
      'Nalgonda',
      'Narayanpet',
      'Nirmal',
      'Nizamabad',
      'Peddapalli',
      'Rajanna Sircilla',
      'Ranga Reddy',
      'Sangareddy',
      'Siddipet',
      'Suryapet',
      'Vikarabad',
      'Wanaparthy',
      'Warangal',
      'Yadadri Bhuvanagiri',
    ];
  }
  if (state === 'Andhra Pradesh') {
    return [
      'Alluri Sitarama Raju',
      'Anakapalli',
      'Parvathipuram Manyam',
      'Srikakulam',
      'Visakhapatnam',
      'Vizianagaram',
      'Bapatla',
      'Dr. B. R. Ambedkar Konaseema',
      'East Godavari',
      'Eluru',
      'Guntur',
      'Kakinada',
      'Krishna',
      'NTR',
      'Palnadu',
      'Prakasam',
      'Sri Potti Sriramulu Nellore',
      'West Godavari',
      'Ananthapuramu',
      'Annamayya',
      'Chittoor',
      'Kurnool',
      'Nandyal',
      'Sri Sathya Sai',
      'Tirupati',
      'YSR Kadapa',
    ];
  }
  return [];
}
