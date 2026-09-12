const LABEL = { instagram: 'Instagram', youtube: 'YouTube' };

/** @param {(number | null)[]} values */
const sumKnown = (values) => {
  const known = values.filter((v) => v != null);
  return known.length ? known.reduce((a, b) => a + b, 0) : null;
};

/** @param {{ scrapedAt: string, profiles: { platform: string, handle: string, url: string, followers: number | null }[], videos: { views: number | null }[] }} social */
export function scoreboardStats(social) {
  const reach = social.profiles.filter((p) => p.platform in LABEL);
  return {
    totalReach: sumKnown(reach.map((p) => p.followers)),
    totalViews: sumKnown(social.videos.map((v) => v.views)),
    accounts: reach.map((p) => ({ label: `${LABEL[p.platform]} @${p.handle}`, value: p.followers, url: p.url })),
    asOf: social.scrapedAt,
  };
}
