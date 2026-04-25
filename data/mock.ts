export type Campaign = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

export type NewsItem = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  isNew?: boolean;
};

export type Episode = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
};

export type Family = {
  id: string;
  name: string;
  description: string;
  image: string;
  progress: number;
  bank: string;
  beneficiary: string;
  accountNumber: string;
};

export const featuredCampaigns: Campaign[] = [
  {
    id: 'camp-1',
    title: 'Hope Driven with Quality Education Resources',
    subtitle: 'Support school kits and mentoring programs',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'camp-2',
    title: 'Provide Clean Water for Remote Villages',
    subtitle: 'Build water systems for mountain families',
    image: 'https://images.unsplash.com/photo-1527072681445-7f6f5c26c7c9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'camp-3',
    title: 'Summer Youth Program',
    subtitle: 'Creative and social activities for children',
    image: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const newsFeed: NewsItem[] = [
  {
    id: 'news-1',
    category: 'Success Stories',
    title: "Ly Family's Roof Finished",
    excerpt: 'Community donations funded materials and volunteer labor in 3 weeks.',
    isNew: true,
  },
  {
    id: 'news-2',
    category: 'Charity Events',
    title: 'Season 3 Officially Kicks Off in HCMC',
    excerpt: 'A weekend fundraising event gathered over 500 participants.',
  },
  {
    id: 'news-3',
    category: 'Program News',
    title: 'New Partnership with Local Medical Centers',
    excerpt: 'Expanded healthcare outreach for underserved communities.',
  },
];

export const quickSuggestions = [
  'How to donate?',
  'About the program',
  'How do families get selected?',
];

export const episodes: Episode[] = [
  {
    id: 'ep-1',
    title: "The Silva Family's New Beginning",
    duration: '10:45',
    thumbnail: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ep-2',
    title: 'Clean Water for Kheo Village',
    duration: '08:20',
    thumbnail: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ep-3',
    title: 'Education First: Rural Schools',
    duration: '09:58',
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  },
];

export const families: Family[] = [
  {
    id: 'fam-1',
    name: 'The Rodriguez Family',
    description: 'Seeking support for school supplies and tuition for the upcoming semester.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80',
    progress: 64,
    bank: 'Vietcombank',
    beneficiary: 'Nguyen Thi L.',
    accountNumber: '1029 4485 9920',
  },
  {
    id: 'fam-2',
    name: 'Green Valley Community',
    description: 'Funding clean water access for 45 families in the highlands.',
    image: 'https://images.unsplash.com/photo-1475776408506-9a5371e7a068?auto=format&fit=crop&w=1200&q=80',
    progress: 47,
    bank: 'BIDV',
    beneficiary: 'Tran Van M.',
    accountNumber: '6638 9921 0042',
  },
];
