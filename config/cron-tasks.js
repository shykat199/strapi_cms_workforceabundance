// Fields a blog must have before it can auto-publish
const REQUIRED_FIELDS = [
  'title',
  'slug',
  'summary',
  'published_time',
  'cover_image',
  'content_blocks',
];

const isEmpty = (v) =>
  v === null ||
  v === undefined ||
  (typeof v === 'string' && v.trim() === '') ||
  (Array.isArray(v) && v.length === 0);

module.exports = {
  publishScheduledBlogs: {
    task: async ({ strapi }) => {
      const uid = 'api::blog.blog';
      const now = new Date();

      // Only drafts that have a schedule date that has arrived
      const drafts = await strapi.documents(uid).findMany({
        status: 'draft',
        filters: { scheduled_at: { $notNull: true, $lte: now.toISOString() } },
        populate: '*',
        limit: 100,
      });

      for (const draft of drafts) {
        try {
          // Skip if already published at or after the scheduled time
          const published = await strapi.documents(uid).findOne({
            documentId: draft.documentId,
            status: 'published',
            locale: draft.locale,
          });
          if (published && new Date(published.publishedAt) >= new Date(draft.scheduled_at)) {
            continue;
          }

          // Only publish complete blogs
          const missing = REQUIRED_FIELDS.filter((f) => isEmpty(draft[f]));
          if (missing.length) {
            strapi.log.warn(
              `[scheduler] NOT published "${draft.title || draft.documentId}" - missing: ${missing.join(', ')}`
            );
            continue;
          }

          await strapi.documents(uid).publish({
            documentId: draft.documentId,
            locale: draft.locale,
          });
          strapi.log.info(`[scheduler] Published "${draft.title}" (scheduled ${draft.scheduled_at})`);
        } catch (e) {
          strapi.log.error(`[scheduler] Failed ${draft.documentId}: ${e.message}`);
        }
      }
    },
    options: {
      rule: '* * * * *', // every minute
    },
  },
};
