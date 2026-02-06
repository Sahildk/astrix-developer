
export type IssueCategory = 'Safety' | 'Maintenance' | 'Harassment' | 'Discrimination';
export type IssueStatus = 'Reported' | 'Under Review' | 'Resolved' | 'Dismissed';

// ... (previous imports)

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: string; // Neighborhood or Building
  landlordName: string; // New field
  date: string;
  upvotes: number;
  isVerified: boolean;
}

const neighborhoods = [
  "Indiranagar", "Koramangala", "Whitefield", "HSR Layout", "Jayanagar",
  "Bandra West", "Andheri East", "Powai", "Colaba", "Dadar",
  "Connaught Place", "Saket", "Dwarka", "Vasant Kunj", "Lajpat Nagar"
];

const landlords = [
  "Sharma Properties", "Reddy Estates", "Gupta Housing", "Prestige Group", "Sobha Developers",
  "Brigade Group", "DLF Ltd", "Godrej Properties", "Oberoi Realty", "Private Owner"
];

const categories: IssueCategory[] = ['Safety', 'Maintenance', 'Harassment', 'Discrimination'];
const statuses: IssueStatus[] = ['Reported', 'Under Review', 'Resolved', 'Dismissed'];

const generateIssues = (count: number): Issue[] => {
  const issues: Issue[] = [];
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const landlord = landlords[Math.floor(Math.random() * landlords.length)];

    let title = "";
    let description = "";

    switch (category) {
      case 'Safety':
        title = `Unsafe wiring in ${neighborhood} complex`;
        description = "Exposed live wires in the common hallway. Fire hazard.";
        break;
      case 'Maintenance':
        title = `Broken elevator in Block B`;
        description = "Elevator has been non-functional for 3 weeks despite repeated requests.";
        break;
      case 'Harassment':
        title = `Landlord intrusion without notice`;
        description = "Landlord enters the apartment without prior notice or permission.";
        break;
      case 'Discrimination':
        title = `Denied rental based on dietary habits`;
        description = "Refused housing because of non-vegetarian food preferences.";
        break;
    }

    // Add variety
    const titles = [
      `Leakage in ceiling at ${neighborhood}`,
      `No water supply for 2 days in ${neighborhood}`,
      `Security guard harassing female tenants`,
      `Deposit not returned after 3 months`,
      `Mold growth ignored by owner`,
      `Stray dogs attacking residents in compound`,
      `Illegal construction noise at night`,
      `Discriminatory rules for bachelors`,
      `CCTV cameras point at private balcony`,
      `Unsanitary garbage disposal`
    ];

    if (Math.random() > 0.5) {
      title = titles[Math.floor(Math.random() * titles.length)];
      description = "This issue has been persisting for a while. We need immediate action from the authorities or the landlord.";
    }

    issues.push({
      id: `issue-${i + 1}`,
      title,
      description,
      category,
      status,
      location: neighborhood,
      landlordName: landlord,
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      upvotes: Math.floor(Math.random() * 50),
      isVerified: Math.random() > 0.7
    });
  }
  return issues;
};

export const MOCK_ISSUES = generateIssues(60);
