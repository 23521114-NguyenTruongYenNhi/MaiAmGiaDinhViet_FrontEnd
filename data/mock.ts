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
  title: string;
  duration: string;
  thumbnail: ImageSourcePropType;
  host: string;
  summary: string;
};

export type Family = {
  id: string;
  name: string;
  description: string;
  image: ImageSourcePropType;
  progress: number;
  bank: string;
  beneficiary: string;
  accountNumber: string;
  location: string;
  urgency: 'High' | 'Medium';
  childrenCount: number;
  monthlyNeed: string;
  supportFocus: string;
  lastVerified: string;
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
    title: 'A family rebuilding stability and hope',
    duration: '45:00',
    thumbnail: heroImage,
    host: 'Featured episode',
    summary: 'A closer look at how community support helps a family protect housing and school access.',
  },
  {
    id: 'ep-2',
    title: 'Field visits that turn care into action',
    duration: '42:30',
    thumbnail: familyImage2,
    host: 'Latest release',
    summary: 'This episode follows the path from profile verification to donor support and field assistance.',
  },
  {
    id: 'ep-3',
    title: 'The story behind each support milestone',
    duration: '40:15',
    thumbnail: familyImage3,
    host: 'Community pick',
    summary: 'Watch how updated family profiles help donors understand urgent needs and next steps more clearly.',
  },
];

export const families: Family[] = [
  {
    id: 'fam-1',
    name: 'Ngoc Family',
    description: 'The family needs support for school expenses, daily essentials, and safer housing conditions for two children.',
    image: familyImage1,
    progress: 64,
    bank: 'Vietcombank',
    beneficiary: 'Nguyen Thi L.',
    accountNumber: '1029 4485 9920',
    location: 'Quang Nam',
    urgency: 'High',
    childrenCount: 2,
    monthlyNeed: '$220/month',
    supportFocus: 'Education support and household stability',
    lastVerified: 'Verified on May 3, 2026',
  },
  {
    id: 'fam-2',
    name: 'Minh Family',
    description: 'This household needs continued help with medical essentials while keeping the children in school.',
    image: familyImage2,
    progress: 47,
    bank: 'BIDV',
    beneficiary: 'Tran Van M.',
    accountNumber: '6638 9921 0042',
    location: 'Phu Yen',
    urgency: 'Medium',
    childrenCount: 3,
    monthlyNeed: '$310/month',
    supportFocus: 'Medical support and school continuity',
    lastVerified: 'Verified on April 29, 2026',
  },
  {
    id: 'fam-3',
    name: 'Lan Family',
    description: 'A single caregiver needs help with food, transportation, and consistent school attendance after recent hardship.',
    image: familyImage3,
    progress: 31,
    bank: 'Agribank',
    beneficiary: 'Pham Thi H.',
    accountNumber: '8704 2201 5586',
    location: 'Can Tho',
    urgency: 'High',
    childrenCount: 2,
    monthlyNeed: '$260/month',
    supportFocus: 'Food assistance and school transportation',
    lastVerified: 'Verified on May 1, 2026',
  },
];
