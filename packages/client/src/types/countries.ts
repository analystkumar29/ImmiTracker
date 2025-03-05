export interface City {
  name: string;
  state?: string;
}

export interface Country {
  name: string;
  code: string;
  cities: City[];
}

// This is a sample of the data structure. The full list should be imported from a comprehensive database
export const countries: Country[] = [
  {
    name: "United States",
    code: "US",
    cities: [
      { name: "New York", state: "NY" },
      { name: "Los Angeles", state: "CA" },
      { name: "Chicago", state: "IL" },
      { name: "Houston", state: "TX" },
      { name: "Phoenix", state: "AZ" },
      { name: "Philadelphia", state: "PA" },
      { name: "San Antonio", state: "TX" },
      { name: "San Diego", state: "CA" },
      { name: "Dallas", state: "TX" },
      { name: "San Jose", state: "CA" }
    ]
  },
  {
    name: "Canada",
    code: "CA",
    cities: [
      { name: "Toronto", state: "ON" },
      { name: "Montreal", state: "QC" },
      { name: "Vancouver", state: "BC" },
      { name: "Calgary", state: "AB" },
      { name: "Edmonton", state: "AB" },
      { name: "Ottawa", state: "ON" },
      { name: "Winnipeg", state: "MB" },
      { name: "Quebec City", state: "QC" },
      { name: "Hamilton", state: "ON" },
      { name: "Halifax", state: "NS" }
    ]
  },
  {
    name: "United Kingdom",
    code: "GB",
    cities: [
      { name: "London" },
      { name: "Manchester" },
      { name: "Birmingham" },
      { name: "Leeds" },
      { name: "Glasgow" },
      { name: "Liverpool" },
      { name: "Newcastle" },
      { name: "Sheffield" },
      { name: "Bristol" },
      { name: "Edinburgh" }
    ]
  },
  {
    name: "Australia",
    code: "AU",
    cities: [
      { name: "Sydney", state: "NSW" },
      { name: "Melbourne", state: "VIC" },
      { name: "Brisbane", state: "QLD" },
      { name: "Perth", state: "WA" },
      { name: "Adelaide", state: "SA" },
      { name: "Gold Coast", state: "QLD" },
      { name: "Newcastle", state: "NSW" },
      { name: "Canberra", state: "ACT" },
      { name: "Wollongong", state: "NSW" },
      { name: "Hobart", state: "TAS" }
    ]
  },
  {
    name: "India",
    code: "IN",
    cities: [
      { name: "Mumbai", state: "Maharashtra" },
      { name: "Delhi" },
      { name: "Bangalore", state: "Karnataka" },
      { name: "Hyderabad", state: "Telangana" },
      { name: "Chennai", state: "Tamil Nadu" },
      { name: "Kolkata", state: "West Bengal" },
      { name: "Pune", state: "Maharashtra" },
      { name: "Ahmedabad", state: "Gujarat" },
      { name: "Surat", state: "Gujarat" },
      { name: "Jaipur", state: "Rajasthan" }
    ]
  },
  {
    name: "China",
    code: "CN",
    cities: [
      { name: "Beijing" },
      { name: "Shanghai" },
      { name: "Guangzhou" },
      { name: "Shenzhen" },
      { name: "Chengdu" }
    ]
  },
  {
    name: "Philippines",
    code: "PH",
    cities: [
      { name: "Manila" },
      { name: "Cebu City" },
      { name: "Davao City" },
      { name: "Quezon City" }
    ]
  },
  {
    name: "Nigeria",
    code: "NG",
    cities: [
      { name: "Lagos" },
      { name: "Abuja" },
      { name: "Port Harcourt" },
      { name: "Kano" }
    ]
  },
  {
    name: "Brazil",
    code: "BR",
    cities: [
      { name: "São Paulo" },
      { name: "Rio de Janeiro" },
      { name: "Brasília" },
      { name: "Salvador" }
    ]
  },
  {
    name: "Mexico",
    code: "MX",
    cities: [
      { name: "Mexico City" },
      { name: "Guadalajara" },
      { name: "Monterrey" },
      { name: "Puebla" }
    ]
  },
  {
    name: "Vietnam",
    code: "VN",
    cities: [
      { name: "Hanoi" },
      { name: "Ho Chi Minh City" },
      { name: "Da Nang" },
      { name: "Hai Phong" }
    ]
  }
];

// Note: For a production application, you should:
// 1. Use a complete countries database (e.g., from a REST API or imported JSON)
// 2. Consider using a third-party service for up-to-date city/country data
// 3. Implement proper search and filtering for better UX with large datasets
// 4. Add more countries and cities as needed for your application 