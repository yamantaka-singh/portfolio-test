// Reels kept off the site by hand, whatever their view count. The scraper still
// finds them (and still lists them as unfiled in its job summary) -- this only
// controls what renders.
// ponytail: a flat list is enough for a handful; move it into innings.json if it
// ever needs a reason recorded per reel.
export const excludedReels = [
  'Dc5BfhLyXjn', // Fazilka Falcons - COMEBACK LOADING
  'Dc9EL1lspXc', // Fazilka Falcons - 1 run ki Kimat
];

export const site = {
  name: 'Abhishek Pandey',
  tagline: 'Spin, Swing, and Everything Cricket. Post-match reactions, stadium vlogs, and fan vox pops.',
  email: 'abhishekpandey4432@gmail.com',
  enquirySubject: 'Brand collaboration enquiry',
  profiles: {
    instagram: ['https://www.instagram.com/abhishekpandey_26/', 'https://www.instagram.com/spinandswing26/'],
    youtube: ['https://www.youtube.com/@spinandswing26', 'https://www.youtube.com/@abhishekunseen26'],
    linkedin: 'https://www.linkedin.com/in/abhishek-pandey-26sep03',
  },
};
