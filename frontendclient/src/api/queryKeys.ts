export const queryKeys = {
  feed: {
    infinite: () => ['feed', 'infinite'] as const,
  },
  posts: {
    list: (search: string) => ['posts', 'list', search] as const,
    detail: (id: string) => ['posts', 'detail', id] as const,
  },
  projects: {
    list: (filters: { search: string; category: string; year: string }) =>
      ['projects', 'list', filters] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
  },
  works: {
    list: (filters: { search: string; workType: string; year: string; area: string }) =>
      ['works', 'list', filters] as const,
    detail: (id: string) => ['works', 'detail', id] as const,
  },
  profile: {
    own: () => ['profile', 'own'] as const,
    byUsername: (u: string) => ['profile', u] as const,
  },
  conversations: {
    list: () => ['conversations', 'list'] as const,
    detail: (id: string) => ['conversations', id] as const,
    messages: (id: string) => ['conversations', id, 'messages'] as const,
  },
  follow: {
    followers: (userId: string) => ['follow', 'followers', userId] as const,
    following: (userId: string) => ['follow', 'following', userId] as const,
  },
};
