/**
 * @param {{ site: { name: string, tagline: string, profiles: { instagram: string[], youtube: string[], linkedin: string } },
 *   videos: { id: string, title: string, views: number | null, publishedAt: string }[], pageUrl: string, imageUrl: string }} args
 */
export function buildJsonLd({ site, videos, pageUrl, imageUrl }) {
  const personId = `${pageUrl}#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: site.name,
        url: pageUrl,
        image: imageUrl,
        jobTitle: 'Cricket content creator',
        description: site.tagline,
        sameAs: [...site.profiles.instagram, ...site.profiles.youtube, site.profiles.linkedin],
      },
      { '@type': 'WebSite', url: pageUrl, name: site.name, about: { '@id': personId } },
      ...videos.map((v) => ({
        '@type': 'VideoObject',
        name: v.title,
        description: v.title,
        thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        uploadDate: v.publishedAt,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
        url: `https://www.youtube.com/watch?v=${v.id}`,
        creator: { '@id': personId },
        ...(v.views != null && {
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'WatchAction' },
            userInteractionCount: v.views,
          },
        }),
      })),
    ],
  };
}
