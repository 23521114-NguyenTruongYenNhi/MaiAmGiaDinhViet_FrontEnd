import { ImageSourcePropType } from 'react-native';

export type Campaign = {
  id: string;
  title: string;
  subtitle: string;
  image: ImageSourcePropType;
};

export type NewsItem = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  body: string;
  isNew?: boolean;
};

export type Episode = {
  id: string;
  episodeNo: number;
  title: string;
  description: string;
  airDate: string;
  videoUrl: string;
  isFeatured: boolean;
  duration: string;
  thumbnail: ImageSourcePropType;
  host: string;
  summary: string;
};

export type Family = {
  id: string;
  caseId: string;
  episodeId: string;
  episodeNo: number;
  episodeTitle: string;
  episodeDate: string;
  name: string;
  description: string;
  story: string;
  image: ImageSourcePropType;
  bank: string;
  beneficiary: string;
  accountNumber: string;
  location: string;
  status: 'ACTIVE' | 'ARCHIVED';
};

const heroImage = require('../assets/images/maiam-episode-hero.jpg');
const familyImage1 = require('../assets/images/maiam-family-1.jpg');
const familyImage2 = require('../assets/images/maiam-family-2.jpg');
const familyImage3 = require('../assets/images/maiam-family-3.jpg');

export const featuredCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Mai Am Gia Dinh Viet',
    subtitle: 'A trusted support platform connecting donors with verified households in urgent need.',
    image: heroImage,
  },
  {
    id: 'camp-2',
    title: 'Verified support for real households',
    subtitle: 'Transparent beneficiary details, verified updates, and a calmer donation experience on mobile.',
    image: familyImage1,
  },
  {
    id: 'camp-3',
    title: 'Community care that reaches real homes',
    subtitle: 'Follow each story, understand the need, and support the right household with confidence.',
    image: familyImage2,
  },
];

export const newsFeed: NewsItem[] = [
  {
    id: 'news-1',
    category: 'Program Update',
    title: 'Verified family stories are now easier to follow across Vietnam',
    excerpt: 'Recent field updates focus on home stability, school continuity, and accountable household support.',
    date: 'May 2026',
    readTime: '4 min read',
    body: 'Family stories are now organized around household stability, education access, and clear donation steps. The mobile experience helps donors understand verified needs faster and move from browsing to support with less friction.',
    isNew: true,
  },
  {
    id: 'news-2',
    category: 'Community',
    title: 'Community support helps families receive assistance faster',
    excerpt: 'A growing donor network helps families move from urgent relief toward more stable monthly support.',
    date: 'April 2026',
    readTime: '3 min read',
    body: 'Community participation remains the engine behind the program. As more donors follow verified family stories, support can be directed more quickly to urgent households while still keeping transparency at the center of the experience.',
  },
  {
    id: 'news-3',
    category: 'Verification',
    title: 'Why verified bank details matter',
    excerpt: 'Clear bank names, beneficiary names, and verification dates improve trust at donation time.',
    date: 'April 2026',
    readTime: '5 min read',
    body: 'Verification is more than an administrative step. It gives donors confidence that beneficiary details are current, makes copying payment information simpler, and helps each family profile feel trustworthy on smaller screens.',
  },
];

export const quickSuggestions = [
  'Show urgent families',
  'How do I copy payment details?',
  'Which stories were updated this week?',
];

export const episodes: Episode[] = [
  {
    id: 'ep-1',
    episodeNo: 184,
    title: 'Mai Am Gia Dinh Viet - Episode 184',
    description: 'A broadcast story following families in difficult circumstances and the support journey created through the program.',
    airDate: 'May 1, 2026',
    videoUrl: 'https://youtu.be/8bXTcPkA-5o',
    isFeatured: true,
    duration: '45:00',
    thumbnail: heroImage,
    host: 'Featured episode',
    summary: 'A closer look at how community support helps a family protect housing and school access.',
  },
  {
    id: 'ep-2',
    episodeNo: 183,
    title: 'Mai Am Gia Dinh Viet - Episode 183',
    description: 'MC and guests join the program to support families through challenges and community giving.',
    airDate: 'April 24, 2026',
    videoUrl: 'https://youtu.be/nx7_UYVzRGo',
    isFeatured: false,
    duration: '42:30',
    thumbnail: familyImage2,
    host: 'Latest release',
    summary: 'This episode follows the path from profile verification to donor support and field assistance.',
  },
  {
    id: 'ep-3',
    episodeNo: 182,
    title: 'Mai Am Gia Dinh Viet - Episode 182',
    description: 'A recent episode featuring multiple families and the support they received through the program.',
    airDate: 'April 17, 2026',
    videoUrl: 'https://youtu.be/Wh6SZ2EQT2Y',
    isFeatured: false,
    duration: '40:15',
    thumbnail: familyImage3,
    host: 'Community pick',
    summary: 'Watch how updated family profiles help donors understand urgent needs and next steps more clearly.',
  },
];

export const families: Family[] = [
  {
    id: 'fam-1',
    caseId: 'case-1',
    episodeId: 'ep-1',
    episodeNo: 184,
    episodeTitle: 'Mai Am Gia Dinh Viet - Episode 184',
    episodeDate: 'May 1, 2026',
    name: 'Pham Thi Truc Phuong',
    description: 'A student in Khanh Hoa whose family has faced repeated loss and continuing financial hardship.',
    story: 'Pham Thi Truc Phuong is a student in Khanh Hoa. Her family has experienced major losses after her father and older brother passed away, leaving the household in a difficult emotional and financial situation.',
    image: familyImage1,
    bank: 'Vietcombank',
    beneficiary: 'Pham Thi Truc Phuong',
    accountNumber: '1029 4485 9920',
    location: 'Khanh Hoa',
    status: 'ACTIVE',
  },
  {
    id: 'fam-2',
    caseId: 'case-2',
    episodeId: 'ep-2',
    episodeNo: 183,
    episodeTitle: 'Mai Am Gia Dinh Viet - Episode 183',
    episodeDate: 'April 24, 2026',
    name: 'Le Anh Ngoc Diem',
    description: 'A family story featured in Episode 183, connected to the program support journey.',
    story: 'Le Anh Ngoc Diem was featured in Episode 183. The program presents the family circumstances, location details, and verified support information for viewers who want to learn more or help.',
    image: familyImage2,
    bank: 'BIDV',
    beneficiary: 'Le Anh Ngoc Diem',
    accountNumber: '6638 9921 0042',
    location: 'Vietnam',
    status: 'ACTIVE',
  },
  {
    id: 'fam-3',
    caseId: 'case-3',
    episodeId: 'ep-3',
    episodeNo: 182,
    episodeTitle: 'Mai Am Gia Dinh Viet - Episode 182',
    episodeDate: 'April 17, 2026',
    name: 'Tran Khai Minh',
    description: 'A family story featured in Episode 182, with bank information available for direct support.',
    story: 'Tran Khai Minh was featured in Episode 182. The profile keeps the broadcast story, location, and verified bank details together so viewers can review information clearly.',
    image: familyImage3,
    bank: 'Agribank',
    beneficiary: 'Tran Khai Minh',
    accountNumber: '8704 2201 5586',
    location: 'Vietnam',
    status: 'ACTIVE',
  },
];
