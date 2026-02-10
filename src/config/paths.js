// Centralized navigation paths so code works from /index.html and /pages/*.html

const inPagesFolder = () => window.location.pathname.includes('/pages/');

export const paths = {
  login: () => (inPagesFolder() ? '../index.html' : './index.html'),
  profile: () => (inPagesFolder() ? './profile.html' : './pages/profile.html'),
  analytics: () => (inPagesFolder() ? './analytics.html' : './pages/analytics.html'),
  activity: () => (inPagesFolder() ? './activity.html' : './pages/activity.html'),
  transactions: () => (inPagesFolder() ? './transactions.html' : './pages/transactions.html'),
  projects: () => (inPagesFolder() ? './projects.html' : './pages/projects.html'),
};
