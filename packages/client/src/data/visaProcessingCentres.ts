export interface VisaProcessingCentre {
  city: string;
  office: string;
}

export interface Country {
  name: string;
  visaProcessingCentres: VisaProcessingCentre[];
  note?: string;
}

export const countries: Country[] = [
  {
    name: "Canada",
    visaProcessingCentres: [
      {
        city: "Ottawa",
        office: "Case Processing Centre – Ottawa (CPC-O)"
      },
      {
        city: "Mississauga",
        office: "Case Processing Centre – Mississauga (CPC-M)"
      },
      {
        city: "Sydney",
        office: "Centralized Intake Office – Sydney (CIO-S) / CPC-S"
      },
      {
        city: "Edmonton",
        office: "Case Processing Centre – Edmonton (CPC-E)"
      },
      {
        city: "Ottawa",
        office: "Operations Support Centre – Ottawa (OSC-O)"
      }
    ],
    note: "Select the appropriate processing centre based on your application type. Each centre handles specific types of applications."
  },
  {
    name: "Afghanistan",
    visaProcessingCentres: [
      { city: "Abu Dhabi", office: "Visa Application Centre, Abu Dhabi" }
    ]
  },
  {
    name: "Albania",
    visaProcessingCentres: [
      { city: "Tirana", office: "Albania VAC" }
    ]
  },
  {
    name: "Algeria",
    visaProcessingCentres: [
      { city: "Algiers", office: "Algeria VAC" }
    ]
  },
  {
    name: "Argentina",
    visaProcessingCentres: [
      { city: "Buenos Aires", office: "Argentina VAC" }
    ]
  },
  {
    name: "Armenia",
    visaProcessingCentres: [
      { city: "Yerevan", office: "Armenia VAC" }
    ]
  },
  {
    name: "Australia",
    visaProcessingCentres: [
      { city: "Perth", office: "Australia VACs" },
      { city: "Melbourne", office: "Australia VACs" },
      { city: "Sydney", office: "Australia VACs" }
    ]
  },
  {
    name: "Azerbaijan",
    visaProcessingCentres: [
      { city: "Baku", office: "Azerbaijan VAC" }
    ]
  },
  {
    name: "Bahrain",
    visaProcessingCentres: [
      { city: "Manama", office: "Bahrain VAC" }
    ]
  },
  {
    name: "Bangladesh",
    visaProcessingCentres: [
      { city: "Dhaka", office: "Bangladesh VACs" },
      { city: "Chittagong", office: "Bangladesh VACs" },
      { city: "Sylhet", office: "Bangladesh VACs" }
    ]
  },
  {
    name: "Barbados",
    visaProcessingCentres: [
      { city: "Bridgetown", office: "Barbados VAC" }
    ]
  },
  {
    name: "Belarus",
    visaProcessingCentres: [],
    note: "No dedicated VAC listed on IRCC page"
  },
  {
    name: "Belgium",
    visaProcessingCentres: [],
    note: "No dedicated VAC listed on IRCC page"
  },
  {
    name: "Bolivia",
    visaProcessingCentres: [
      { city: "La Paz", office: "Bolivia VAC" }
    ]
  },
  {
    name: "Bosnia and Herzegovina",
    visaProcessingCentres: [
      { city: "Sarajevo", office: "Bosnia and Herzegovina VAC" }
    ]
  },
  {
    name: "Brazil",
    visaProcessingCentres: [
      { city: "Brasilia", office: "Brazil VACs" },
      { city: "Porto Alegre", office: "Brazil VACs" },
      { city: "Recife", office: "Brazil VACs" },
      { city: "Rio de Janeiro", office: "Brazil VACs" },
      { city: "Sao Paulo", office: "Brazil VACs" }
    ]
  },
  {
    name: "Burkina Faso",
    visaProcessingCentres: [
      { city: "Ouagadougou", office: "Burkina Faso VAC" }
    ]
  },
  {
    name: "Myanmar",
    visaProcessingCentres: [
      { city: "Yangon (Rangoon)", office: "Myanmar VAC" }
    ]
  },
  {
    name: "Cambodia",
    visaProcessingCentres: [
      { city: "Phnom Penh", office: "Cambodia VAC" }
    ]
  },
  {
    name: "Cameroon",
    visaProcessingCentres: [
      { city: "Yaoundé", office: "Cameroon VAC" }
    ]
  },
  {
    name: "Chile",
    visaProcessingCentres: [
      { city: "Santiago", office: "Chile VAC" }
    ]
  },
  {
    name: "China",
    visaProcessingCentres: [
      { city: "Beijing", office: "China VACs" },
      { city: "Chengdu", office: "China VACs" },
      { city: "Chongqing", office: "China VACs" },
      { city: "Guangzhou", office: "China VACs" },
      { city: "Hangzhou", office: "China VACs" },
      { city: "Jinan", office: "China VACs" },
      { city: "Kunming", office: "China VACs" },
      { city: "Nanjing", office: "China VACs" },
      { city: "Shanghai", office: "China VACs" },
      { city: "Shenyang", office: "China VACs" },
      { city: "Wuhan", office: "China VACs" }
    ]
  },
  {
    name: "Colombia",
    visaProcessingCentres: [
      { city: "Bogota", office: "Colombia VACs" },
      { city: "Cali", office: "Colombia VACs" },
      { city: "Medellin", office: "Colombia VACs" }
    ]
  },
  {
    name: "Costa Rica",
    visaProcessingCentres: [
      { city: "San Jose", office: "Costa Rica VAC" }
    ]
  },
  {
    name: "Democratic Rep. of Congo",
    visaProcessingCentres: [
      { city: "Kinshasa", office: "Democratic Rep. of Congo VAC" }
    ]
  },
  {
    name: "Dominican Republic",
    visaProcessingCentres: [
      { city: "Santo Domingo", office: "Dominican Republic VAC" }
    ]
  },
  {
    name: "Ecuador",
    visaProcessingCentres: [
      { city: "Quito", office: "Ecuador VAC" }
    ]
  },
  {
    name: "Egypt",
    visaProcessingCentres: [
      { city: "Cairo", office: "Egypt VAC" }
    ]
  },
  {
    name: "El Salvador",
    visaProcessingCentres: [
      { city: "San Salvador", office: "El Salvador VAC" }
    ]
  },
  {
    name: "Ethiopia",
    visaProcessingCentres: [
      { city: "Addis Ababa", office: "Ethiopia VAC" }
    ]
  },
  {
    name: "Fiji",
    visaProcessingCentres: [
      { city: "Suva", office: "Fiji VAC" }
    ]
  },
  {
    name: "Finland",
    visaProcessingCentres: [
      { city: "Helsinki", office: "Finland VAC" }
    ]
  },
  {
    name: "France",
    visaProcessingCentres: [
      { city: "Lyon", office: "France VACs" },
      { city: "Paris", office: "France VACs" }
    ]
  },
  {
    name: "Georgia",
    visaProcessingCentres: [
      { city: "Tbilisi", office: "Georgia VAC" }
    ]
  },
  {
    name: "Germany",
    visaProcessingCentres: [
      { city: "Berlin", office: "Germany VACs" },
      { city: "Düsseldorf", office: "Germany VACs" }
    ]
  },
  {
    name: "Ghana",
    visaProcessingCentres: [
      { city: "Accra", office: "Ghana VAC" }
    ]
  },
  {
    name: "Greece",
    visaProcessingCentres: [
      { city: "Athens", office: "Greece VAC" }
    ]
  },
  {
    name: "Guatemala",
    visaProcessingCentres: [
      { city: "Guatemala City", office: "Guatemala VAC" }
    ]
  },
  {
    name: "Guinea",
    visaProcessingCentres: [
      { city: "Conakry", office: "Guinea VAC" }
    ]
  },
  {
    name: "Guyana",
    visaProcessingCentres: [
      { city: "Georgetown", office: "Guyana VAC" }
    ]
  },
  {
    name: "Haiti",
    visaProcessingCentres: [
      { city: "Port-au-Prince", office: "Haiti VAC" }
    ]
  },
  {
    name: "Honduras",
    visaProcessingCentres: [
      { city: "Tegucigalpa", office: "Honduras VAC" }
    ]
  },
  {
    name: "Hong Kong SAR",
    visaProcessingCentres: [
      { city: "Hong Kong", office: "Hong Kong VAC" }
    ]
  },
  {
    name: "India",
    visaProcessingCentres: [
      { city: "New Delhi", office: "India VACs" },
      { city: "Mumbai", office: "India VACs" },
      { city: "Chennai", office: "India VACs" },
      { city: "Kolkata", office: "India VACs" },
      { city: "Pune", office: "India VACs" },
      { city: "Ahmedabad", office: "India VACs" },
      { city: "Bengaluru", office: "India VACs" },
      { city: "Chandigarh", office: "India VACs" },
      { city: "Jalandhar", office: "India VACs" },
      { city: "Hyderabad", office: "India VACs" }
    ]
  },
  {
    name: "Indonesia",
    visaProcessingCentres: [
      { city: "Bali", office: "Indonesia VACs" },
      { city: "Jakarta", office: "Indonesia VACs" }
    ]
  },
  {
    name: "Iraq",
    visaProcessingCentres: [
      { city: "Erbil", office: "Iraq VAC" }
    ]
  },
  {
    name: "Ireland",
    visaProcessingCentres: [
      { city: "Dublin", office: "Ireland VAC" }
    ]
  },
  {
    name: "Israel",
    visaProcessingCentres: [
      { city: "Tel Aviv", office: "Israel VAC" }
    ]
  },
  {
    name: "Italy",
    visaProcessingCentres: [
      { city: "Rome", office: "Italy VAC" }
    ]
  },
  {
    name: "Ivory Coast",
    visaProcessingCentres: [
      { city: "Abidjan", office: "Ivory Coast VAC" }
    ]
  },
  {
    name: "Jamaica",
    visaProcessingCentres: [
      { city: "Kingston", office: "Jamaica VACs" },
      { city: "Montego Bay", office: "Jamaica VACs" }
    ]
  },
  {
    name: "Japan",
    visaProcessingCentres: [
      { city: "Tokyo", office: "Japan VACs" },
      { city: "Osaka", office: "Japan VACs" }
    ]
  },
  {
    name: "Jordan",
    visaProcessingCentres: [
      { city: "Amman", office: "Jordan VAC" }
    ]
  },
  {
    name: "Kazakhstan",
    visaProcessingCentres: [
      { city: "Almaty", office: "Kazakhstan VACs" },
      { city: "Astana", office: "Kazakhstan VACs" }
    ]
  },
  {
    name: "Kenya",
    visaProcessingCentres: [
      { city: "Nairobi", office: "Kenya VAC" }
    ]
  },
  {
    name: "Kosovo",
    visaProcessingCentres: [
      { city: "Pristina", office: "Kosovo VAC" }
    ]
  },
  {
    name: "Kuwait",
    visaProcessingCentres: [
      { city: "Kuwait City", office: "Kuwait VAC" }
    ]
  },
  {
    name: "Kyrgyzstan",
    visaProcessingCentres: [
      { city: "Bishkek", office: "Kyrgyzstan VAC" }
    ]
  },
  {
    name: "Lebanon",
    visaProcessingCentres: [
      { city: "Beirut", office: "Lebanon VAC" }
    ]
  },
  {
    name: "North Macedonia",
    visaProcessingCentres: [
      { city: "Skopje", office: "North Macedonia VAC" }
    ]
  },
  {
    name: "Madagascar",
    visaProcessingCentres: [
      { city: "Antananarivo", office: "Madagascar VAC" }
    ]
  },
  {
    name: "Malaysia",
    visaProcessingCentres: [
      { city: "Kuala Lumpur", office: "Malaysia VAC" }
    ]
  },
  {
    name: "Mali",
    visaProcessingCentres: [
      { city: "Bamako", office: "Mali VAC" }
    ]
  },
  {
    name: "Mauritius",
    visaProcessingCentres: [
      { city: "Port Louis", office: "Mauritius VAC" }
    ]
  },
  {
    name: "Mexico",
    visaProcessingCentres: [
      { city: "Guadalajara", office: "Mexico VACs" },
      { city: "Monterrey", office: "Mexico VACs" },
      { city: "Mexico City", office: "Mexico VACs" }
    ]
  },
  {
    name: "Moldova",
    visaProcessingCentres: [
      { city: "Chisinau", office: "Moldova VAC" }
    ]
  },
  {
    name: "Mongolia",
    visaProcessingCentres: [
      { city: "Ulaanbaatar", office: "Mongolia VAC" }
    ]
  },
  {
    name: "Morocco",
    visaProcessingCentres: [
      { city: "Rabat", office: "Morocco VAC" }
    ]
  },
  {
    name: "Nepal",
    visaProcessingCentres: [
      { city: "Kathmandu", office: "Nepal VAC" }
    ]
  },
  {
    name: "New Zealand",
    visaProcessingCentres: [
      { city: "Auckland", office: "New Zealand VAC" }
    ]
  },
  {
    name: "Nicaragua",
    visaProcessingCentres: [
      { city: "Managua", office: "Nicaragua VAC" }
    ]
  },
  {
    name: "Niger",
    visaProcessingCentres: [
      { city: "Niamey", office: "Niger VAC" }
    ]
  },
  {
    name: "Nigeria",
    visaProcessingCentres: [
      { city: "Abuja", office: "Nigeria VACs" },
      { city: "Lagos", office: "Nigeria VACs" }
    ]
  },
  {
    name: "Oman",
    visaProcessingCentres: [
      { city: "Muscat", office: "Oman VAC" }
    ]
  },
  {
    name: "Pakistan",
    visaProcessingCentres: [
      { city: "Islamabad", office: "Pakistan VACs" },
      { city: "Karachi", office: "Pakistan VACs" },
      { city: "Lahore", office: "Pakistan VACs" },
      { city: "Peshawar", office: "Pakistan VACs" }
    ]
  },
  {
    name: "Panama",
    visaProcessingCentres: [
      { city: "Panama City", office: "Panama VAC" }
    ]
  },
  {
    name: "Paraguay",
    visaProcessingCentres: [
      { city: "Asuncion", office: "Paraguay VAC" }
    ]
  },
  {
    name: "Peru",
    visaProcessingCentres: [
      { city: "Lima", office: "Peru VAC" }
    ]
  },
  {
    name: "Philippines",
    visaProcessingCentres: [
      { city: "Manila", office: "Philippines VACs" },
      { city: "Cebu", office: "Philippines VACs" }
    ]
  },
  {
    name: "Poland",
    visaProcessingCentres: [
      { city: "Warsaw", office: "Poland VAC" }
    ]
  },
  {
    name: "Qatar",
    visaProcessingCentres: [
      { city: "Doha", office: "Qatar VAC" }
    ]
  },
  {
    name: "Romania",
    visaProcessingCentres: [
      { city: "Bucharest", office: "Romania VAC" }
    ]
  },
  {
    name: "Russia",
    visaProcessingCentres: [
      { city: "Moscow", office: "Russia VACs" },
      { city: "Novosibirsk", office: "Russia VACs" },
      { city: "Rostov-on-Don", office: "Russia VACs" },
      { city: "Saint Petersburg", office: "Russia VACs" },
      { city: "Vladivostok", office: "Russia VACs" },
      { city: "Yekaterinburg", office: "Russia VACs" }
    ]
  },
  {
    name: "Rwanda",
    visaProcessingCentres: [
      { city: "Kigali", office: "Rwanda VAC" }
    ]
  },
  {
    name: "Saint Lucia",
    visaProcessingCentres: [
      { city: "Castries", office: "Saint Lucia VAC" }
    ]
  },
  {
    name: "Saint Vincent and the Grenadines",
    visaProcessingCentres: [
      { city: "Kingstown", office: "Saint Vincent and the Grenadines VAC" }
    ]
  },
  {
    name: "Saudi Arabia",
    visaProcessingCentres: [
      { city: "Al Khobar", office: "Saudi Arabia VACs" },
      { city: "Jeddah", office: "Saudi Arabia VACs" },
      { city: "Riyadh", office: "Saudi Arabia VACs" }
    ]
  },
  {
    name: "Senegal",
    visaProcessingCentres: [
      { city: "Dakar", office: "Senegal VAC" }
    ]
  },
  {
    name: "Serbia",
    visaProcessingCentres: [
      { city: "Belgrade", office: "Serbia VAC" }
    ]
  },
  {
    name: "Singapore",
    visaProcessingCentres: [
      { city: "Singapore", office: "Singapore VAC" }
    ]
  },
  {
    name: "South Africa",
    visaProcessingCentres: [
      { city: "Cape Town", office: "South Africa VACs" },
      { city: "Pretoria", office: "South Africa VACs" }
    ]
  },
  {
    name: "South Korea",
    visaProcessingCentres: [
      { city: "Seoul", office: "South Korea VAC" }
    ]
  },
  {
    name: "Spain",
    visaProcessingCentres: [
      { city: "Madrid", office: "Spain VAC" }
    ]
  },
  {
    name: "Sri Lanka",
    visaProcessingCentres: [
      { city: "Colombo", office: "Sri Lanka VAC" }
    ]
  },
  {
    name: "Sweden",
    visaProcessingCentres: [
      { city: "Stockholm", office: "Sweden VAC" }
    ]
  },
  {
    name: "Taiwan",
    visaProcessingCentres: [
      { city: "Taipei", office: "Taiwan VAC" }
    ]
  },
  {
    name: "Tajikistan",
    visaProcessingCentres: [
      { city: "Dushanbe", office: "Tajikistan VAC" }
    ]
  },
  {
    name: "Tanzania",
    visaProcessingCentres: [
      { city: "Dar es Salaam", office: "Tanzania VAC" }
    ]
  },
  {
    name: "Thailand",
    visaProcessingCentres: [
      { city: "Bangkok", office: "Thailand VAC" }
    ]
  },
  {
    name: "The Netherlands",
    visaProcessingCentres: [
      { city: "The Hague", office: "The Netherlands VAC" }
    ]
  },
  {
    name: "Trinidad and Tobago",
    visaProcessingCentres: [
      { city: "Port of Spain", office: "Trinidad and Tobago VAC" }
    ]
  },
  {
    name: "Tunisia",
    visaProcessingCentres: [
      { city: "Tunis", office: "Tunisia VAC" }
    ]
  },
  {
    name: "Türkiye",
    visaProcessingCentres: [
      { city: "Ankara", office: "Türkiye VACs" },
      { city: "Istanbul", office: "Türkiye VACs" }
    ]
  },
  {
    name: "Uganda",
    visaProcessingCentres: [
      { city: "Kampala", office: "Uganda VAC" }
    ]
  },
  {
    name: "Ukraine",
    visaProcessingCentres: [
      { city: "Kyiv", office: "Ukraine VACs" },
      { city: "Lviv", office: "Ukraine VACs" }
    ]
  },
  {
    name: "United Arab Emirates",
    visaProcessingCentres: [
      { city: "Abu Dhabi", office: "United Arab Emirates VACs" },
      { city: "Dubai", office: "United Arab Emirates VACs" }
    ]
  },
  {
    name: "United Kingdom",
    visaProcessingCentres: [
      { city: "London", office: "United Kingdom VAC" }
    ]
  },
  {
    name: "United States",
    visaProcessingCentres: [
      { city: "Los Angeles", office: "United States VACs" },
      { city: "New York", office: "United States VACs" }
    ]
  },
  {
    name: "Uruguay",
    visaProcessingCentres: [
      { city: "Montevideo", office: "Uruguay VAC" }
    ]
  },
  {
    name: "Venezuela",
    visaProcessingCentres: [
      { city: "Caracas", office: "Venezuela VAC" }
    ]
  },
  {
    name: "Vietnam",
    visaProcessingCentres: [
      { city: "Hanoi", office: "Vietnam VACs" },
      { city: "Ho Chi Minh", office: "Vietnam VACs" }
    ]
  },
  {
    name: "Zimbabwe",
    visaProcessingCentres: [
      { city: "Harare", office: "Zimbabwe VAC" }
    ]
  },
];

// Helper functions
export const getCountryNames = (): string[] => {
  return countries.map(country => country.name);
};

export const getVisaProcessingCentres = (countryName: string): VisaProcessingCentre[] => {
  const country = countries.find(c => c.name === countryName);
  return country?.visaProcessingCentres || [];
}; 