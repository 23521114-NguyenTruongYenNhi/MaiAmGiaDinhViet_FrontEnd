export const palette = {
  primary: '#8B1D1D',
  cream: '#FAF7F2',
  white: '#FFFFFF',
  mustard: '#D6A84A',
  text: '#2B2B2B',
  muted: '#8E8E8E',
  border: '#E7DED4',
  softSurface: '#F2ECE4',
  success: '#1F8B4C',
  danger: '#B3261E',
} as const;

export const appCopy = {
  appName: 'Mái Ấm Gia Đình Việt',
} as const;

export const typography = {
  display: {
    fontFamily: 'BeVietnamPro_700Bold',
    letterSpacing: -0.4,
  },
  heading: {
    fontFamily: 'BeVietnamPro_600SemiBold',
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: 'BeVietnamPro_400Regular',
    lineHeight: 22,
  },
  caption: {
    fontFamily: 'BeVietnamPro_500Medium',
    lineHeight: 18,
  },
} as const;

export const radii = {
  card: 16,
  input: 16,
  pill: 999,
} as const;
