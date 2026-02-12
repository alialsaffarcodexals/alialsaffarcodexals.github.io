// Keep page paths in one place.

// Detect whether current HTML file is already inside /pages/.
const inPagesFolder = () => window.location.pathname.includes('/pages/');

// Each key returns a relative URL that works from both root and /pages/.
export const paths = {
  // Login page path helper.
  login: () => (inPagesFolder() ? '../index.html' : './index.html'),
  // Profile page path helper.
  profile: () => (inPagesFolder() ? './profile.html' : './pages/profile.html'),
  // Analytics page path helper.
  analytics: () => (inPagesFolder() ? './analytics.html' : './pages/analytics.html'),
  // Activity page path helper.
  activity: () => (inPagesFolder() ? './activity.html' : './pages/activity.html'),
  // Transactions page path helper.
  transactions: () => (inPagesFolder() ? './transactions.html' : './pages/transactions.html'),
  // Projects page path helper.
  projects: () => (inPagesFolder() ? './projects.html' : './pages/projects.html'),
};
