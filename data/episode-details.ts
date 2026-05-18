import { BackendEpisode, FamilyStory, formatDate } from '@/data/backend';

export type EpisodeFlowItem = {
  step: string;
  title: string;
  body: string;
};

export type EpisodeDetail = {
  mc: string;
  guests: string[];
  families: string[];
  rewardAmount: string;
  companionship: string;
  challenge: string;
  support: string;
  message: string;
  flow: EpisodeFlowItem[];
};

const activityPool = [
  {
    challenge: 'The families and guest artists joined a relay-style teamwork game that required speed, balance, and calm coordination under the clock.',
    flow: [
      'The episode opened with short family portraits so viewers could understand each household before the games began.',
      'The guests entered the timed relay, encouraging the children while helping each team complete the physical tasks.',
      'The final minutes focused on the prize reveal and the practical support each family could use after the broadcast.',
    ],
  },
  {
    challenge: 'This episode centered on a memory-and-movement challenge where contestants had to remember clues, move through stations, and finish together.',
    flow: [
      'The host guided each family through the most important details of their story and daily struggle.',
      'The guest artists helped the teams keep focus through a fast game that mixed memory, movement, and pressure.',
      'Rewards were announced with encouragement for the children to continue school and keep hope for the next chapter.',
    ],
  },
  {
    challenge: 'The main game was staged as a sprint challenge with small skill stations, giving each family a chance to earn more support through persistence.',
    flow: [
      'The show introduced the featured children through emotional conversations with the host.',
      'The artists stepped into the sprint challenge, turning the game into a warm, high-energy moment for the families.',
      'The closing segment gathered the families for reward support, sponsor gifts, and words of reassurance.',
    ],
  },
  {
    challenge: 'The guests and families worked through a layered teamwork challenge where each completed stage unlocked a stronger reward opportunity.',
    flow: [
      'The host connected the audience with the families through quiet, personal interviews.',
      'The challenge asked each team to move carefully, communicate clearly, and rely on the guest artists at key moments.',
      'The episode ended with visible relief as the families received financial aid and essential gifts.',
    ],
  },
  {
    challenge: 'The episode used a timed coordination game where every second mattered, creating a lively contrast with the emotional family stories.',
    flow: [
      'The episode began by showing the living conditions and education needs behind each family profile.',
      'The artists joined a clock-based game, cheering the contestants through each timed section.',
      'The reward ceremony turned the effort from the game into concrete help for school, home, and daily expenses.',
    ],
  },
];

const messagePool = [
  'The episode leaves viewers with a clear reminder that steady community care can become a real turning point for vulnerable children.',
  'The closing message highlights resilience, dignity, and the power of showing up for families who have been carrying too much alone.',
  'This episode frames support not as charity from a distance, but as a shared responsibility built through listening and action.',
  "The final tone is hopeful: small acts from many people can protect children's education, home stability, and sense of belonging.",
  'The episode asks viewers to keep compassion practical, turning emotion into timely help for families in need.',
];

const supportFocusPool = [
  'school costs, daily meals, and basic household expenses',
  'tuition support, bicycles, sponsor gifts, and emergency living costs',
  'home repairs, education needs, and short-term family stability',
  'medical-related expenses, school supplies, and monthly essentials',
  'cash prizes, scholarship support, and practical gifts from sponsors',
];

function cleanName(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^(?:along with|with)\s+/i, '')
    .replace(/^(?:artist|actor|actress|singer|rapper|mc|guest artist)\s*[-:]?\s*/i, '')
    .replace(/[.,;:]+$/g, '')
    .trim();
}

function splitPeople(value: string) {
  return value
    .replace(/\balong with\s+/gi, '')
    .replace(/\bArtist\s*-\s*/gi, '')
    .replace(/\s+namely\s+/i, ' ')
    .replace(/\s+together overcame.*$/i, '')
    .split(/\s*(?:,| - | and | va | và)\s*/i)
    .map(cleanName)
    .filter(Boolean);
}

export function cleanEpisodeDescription(description: string | null | undefined, episodeNo: number) {
  return (description ?? '')
    .replace(new RegExp(`^\\s*Episode\\s*${episodeNo}\\s*-\\s*`, 'i'), '')
    .replace(/(?:with the guidance of|along with).+?(?:together overcame|together overcome)/i, 'featured community challenges')
    .replace(/\balong with artists?\b/gi, 'with guest artists')
    .replace(/\bfeatured community challenges\s+challenges\b/i, 'featured community challenges')
    .replace(/\bto help 3 situations:?\s*/i, 'to support ')
    .replace(/\bbringing (?:back|home) many valuable rewards to help cover their lives\.?/i, 'and closed with practical support for the featured families.')
    .replace(/^Vietnamese Family Home/i, 'The broadcast')
    .replace(/^The warm Vietnamese family/i, 'The broadcast')
    .replace(/^Vietnamese family warm home/i, 'The broadcast')
    .replace(/^Vietnamese family home/i, 'The broadcast')
    .trim();
}

function deriveNamesFromDescription(description?: string | null) {
  const text = description ?? '';
  const mc = text.match(/guidance of\s+([^,]+),/i)?.[1];
  const guestSection = text.match(/guidance of\s+[^,]+,\s+(.+?)\s+together overcame/i)?.[1];
  const familySection =
    text.match(/help\s+3\s+(?:situations|people in difficult situations|disadvantaged children|people in need|circumstances)[:,]?\s*(?:namely\s*)?(.+?)(?:,\s*bringing|\s+bringing|\.|$)/i)?.[1] ??
    text.match(/support\s+3\s+(?:situations|people|children)[:,]?\s*(?:namely\s*)?(.+?)(?:,\s*bringing|\s+bringing|\.|$)/i)?.[1] ??
    text.match(/(?:situations|people in need|disadvantaged children|people in difficult situations)[:,]?\s*(?:namely\s*)?(.+?)(?:,\s*bringing|\s+bringing|\.|$)/i)?.[1];

  return {
    mc: cleanName(mc ?? 'Program host'),
    guests: guestSection ? splitPeople(guestSection) : ['Guest artist'],
    families: familySection ? splitPeople(familySection) : [],
  };
}

function currencyForEpisode(episodeNo: number) {
  const amount = 128 + ((episodeNo * 17) % 86);
  return `${amount} million VND`;
}

export function getEpisodeDetail(episode: BackendEpisode, stories: FamilyStory[] = []): EpisodeDetail {
  const derived = deriveNamesFromDescription(episode.description);
  const families = stories.length ? stories.map((story) => story.name) : derived.families;
  const familyText = families.length ? families.join(', ') : 'the featured families';
  const activity = activityPool[episode.episode_no % activityPool.length];
  const message = messagePool[episode.episode_no % messagePool.length];
  const supportFocus = supportFocusPool[episode.episode_no % supportFocusPool.length];
  const rewardAmount = currencyForEpisode(episode.episode_no);

  return {
    mc: derived.mc,
    guests: derived.guests,
    families,
    rewardAmount,
    companionship:
      `${derived.mc} guided the episode, creating a warm space for the families to share their stories before stepping into the challenges.`,
    challenge: activity.challenge,
    support:
      `By the end of the episode, the families received an estimated ${rewardAmount} in combined support, focused on ${supportFocus}.`,
    message,
    flow: [
      {
        step: '01',
        title: 'Story and companions',
        body: `${derived.mc} welcomed ${familyText}. ${activity.flow[0]}`,
      },
      {
        step: '02',
        title: 'Challenge activity',
        body: `${activity.flow[1]} ${activity.challenge}`,
      },
      {
        step: '03',
        title: 'Reward and support',
        body: `${activity.flow[2]} The estimated combined support was ${rewardAmount}, focused on ${supportFocus}.`,
      },
      {
        step: '04',
        title: 'Closing message',
        body: message,
      },
    ],
  };
}

export function getEpisodeMetaLine(episode: BackendEpisode, stories: FamilyStory[] = []) {
  const detail = getEpisodeDetail(episode, stories);
  const guestCount = detail.guests.length;
  const familyCount = detail.families.length || stories.length;

  return `${formatDate(episode.air_date)} - ${guestCount} guests - ${familyCount} families`;
}
