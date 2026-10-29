import { CATEGORIES, GALLERY_CATEGORIES, NEWS_CATEGORIES, POSITION_CATEGORIES, defaults } from '../../data/content.js'

const status = { key: 'status', label: 'Status', type: 'select', options: [{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft (hidden)' }] }
const badge = (it) => (it.status === 'draft' ? 'Draft' : 'Published')

export const profileFields = [
  { key: 'name', label: 'Name as shown', wide: false },
  { key: 'officialName', label: 'Name in Parliament records' },
  { key: 'title', label: 'Title' },
  { key: 'party', label: 'Party' },
  { key: 'elected', label: 'Elected' },
  { key: 'parliament', label: 'Parliament' },
  { key: 'intro', label: 'Home page introduction', type: 'textarea', wide: true },
  { key: 'bio', label: 'Biography paragraphs', type: 'strings', long: true, wide: true },
  { key: 'vision', label: 'Vision statement (shown on About when filled)', type: 'textarea', wide: true },
  { key: 'photo', label: 'Main portrait', type: 'image', side: 1000, wide: true, hint: 'Used wherever a spot below has no photo of its own.' },
  { key: 'heroPhoto', label: 'Home page hero photo', type: 'image', side: 1100, wide: true, hint: 'The large photo at the top of the Home page. Leave empty to use the main portrait.' },
  { key: 'homeAboutPhoto', label: 'Home page About section photo', type: 'image', side: 900, wide: true, hint: 'The photo beside the short biography on the Home page. Leave empty to use the main portrait.' },
  { key: 'aboutPhoto', label: 'About page photo', type: 'image', side: 900, wide: true, hint: 'The photo at the top of the About page. Leave empty to use the main portrait.' },
  { key: 'interests', label: 'Areas of interest (scrolling ticker)', type: 'strings', wide: true },
  { key: 'focus', label: 'Focus areas (home page cards)', type: 'list', noun: 'focus area', wide: true, fields: [{ key: 'title', label: 'Title' }, { key: 'text', label: 'Text', type: 'textarea' }] },
  { key: 'timeline', label: 'Career timeline', type: 'list', noun: 'entry', wide: true, fields: [{ key: 'when', label: 'When' }, { key: 'title', label: 'Title' }, { key: 'detail', label: 'Detail', type: 'textarea' }] },
  { key: 'education', label: 'Education', type: 'list', noun: 'qualification', wide: true, fields: [{ key: 'when', label: 'Years' }, { key: 'title', label: 'Qualification' }, { key: 'detail', label: 'Institution' }] },
]

export const parliamentFields = [
  { key: 'stats', label: 'Figures', type: 'list', noun: 'figure', wide: true, fields: [{ key: 'value', label: 'Number', type: 'number' }, { key: 'label', label: 'Label' }] },
  { key: 'votes', label: 'Votes', type: 'group', wide: true, fields: [{ key: 'aye', label: 'Aye', type: 'number' }, { key: 'no', label: 'No', type: 'number' }, { key: 'absent', label: 'Absent', type: 'number' }] },
  { key: 'committees', label: 'Committees and caucuses', type: 'list', noun: 'committee', wide: true, fields: [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'note', label: 'Note' }] },
  { key: 'bills', label: 'Bills', type: 'list', noun: 'Bill', wide: true, fields: [{ key: 'title', label: 'Bill' }, { key: 'year', label: 'Year' }, { key: 'status', label: 'Status (blank = to be confirmed)' }] },
  { key: 'billsNote', label: 'Note under the Bills table', type: 'textarea', wide: true },
  { key: 'motions', label: 'Recent motions', type: 'list', noun: 'motion', wide: true, fields: [{ key: 'date', label: 'Date' }, { key: 'title', label: 'Motion' }, { key: 'outcome', label: 'Outcome' }] },
  { key: 'questions', label: 'Questions to Cabinet Secretaries', type: 'list', noun: 'question', wide: true, fields: [{ key: 'date', label: 'Date' }, { key: 'title', label: 'Question' }, { key: 'to', label: 'Asked of (e.g. Treasury CS)' }, { key: 'status', label: 'Status' }] },
  { key: 'source', label: 'Source note', wide: true },
]

export const contactFields = [
  { key: 'office', label: 'Constituency office address', type: 'textarea', wide: true },
  { key: 'parliament', label: 'Parliament address' },
  { key: 'email', label: 'Office email', type: 'email' },
  { key: 'phone', label: 'Office phone', type: 'tel' },
  { key: 'social', label: 'Social links (Facebook, X, YouTube, TikTok…)', type: 'list', noun: 'link', wide: true, fields: [{ key: 'label', label: 'Name' }, { key: 'url', label: 'Link', type: 'url' }] },
  { key: 'links', label: 'Other links', type: 'list', noun: 'link', wide: true, fields: [{ key: 'label', label: 'Name' }, { key: 'url', label: 'Link', type: 'url' }] },
]

export const projectsConfig = {
  coll: 'projects',
  title: 'Projects',
  blurb: 'Add what was delivered in Gatundu South. Each project can have up to 5 photos, and they also appear in the Gallery. New items show on the site straight away.',
  noun: 'Project',
  empty: { title: '', category: CATEGORIES[0], year: String(new Date().getFullYear()), ward: '', amount: 0, description: '', photos: [], status: 'published' },
  fields: [
    { key: 'title', label: 'Title', required: true, wide: true },
    { key: 'category', label: 'Category', type: 'select', options: CATEGORIES },
    { key: 'year', label: 'Year' },
    { key: 'ward', label: 'Ward' },
    { key: 'amount', label: 'Amount (KES)', type: 'number' },
    { key: 'description', label: 'Description', type: 'textarea', wide: true, hint: 'One or two lines on what was done and who benefits.' },
    { key: 'photos', label: 'Photos', type: 'images', max: 5, wide: true },
    status,
  ],
  columns: [
    { key: 'title', label: 'Project' },
    { key: 'category', label: 'Category' },
    { key: 'year', label: 'Year' },
    { key: 'photos', label: 'Photos', render: (it) => (it.photos || []).length },
    { key: 'status', label: 'Status', render: badge },
  ],
  importer: {
    columns: ['title', 'category', 'year', 'ward', 'amount', 'description'],
    example: ['Classroom block', 'Education', '2025', 'Gatundu', '1500000', 'Four new classrooms and desks.'],
    map: (r) => ({
      title: String(r.title || '').trim(),
      category: CATEGORIES.includes(r.category) ? r.category : 'Other',
      year: String(r.year || ''),
      ward: String(r.ward || ''),
      amount: Number(String(r.amount || '0').replace(/[^\d.]/g, '')) || 0,
      description: String(r.description || ''),
      photos: [],
      status: 'published',
    }),
  },
}

export const positionsConfig = {
  coll: 'positions',
  title: 'Positions',
  blurb: 'Seats, boards, directorships and community roles, shown on the Positions page. Lower numbers appear first.',
  noun: 'Position',
  empty: { title: '', organisation: '', category: POSITION_CATEGORIES[0], period: '', description: '', order: 50, status: 'published' },
  fields: [
    { key: 'title', label: 'Position', required: true, wide: true },
    { key: 'organisation', label: 'Organisation' },
    { key: 'category', label: 'Group', type: 'select', options: POSITION_CATEGORIES },
    { key: 'period', label: 'When (e.g. 2022 to present)' },
    { key: 'order', label: 'Order on the page', type: 'number' },
    { key: 'description', label: 'Short description', type: 'textarea', wide: true },
    status,
  ],
  columns: [
    { key: 'title', label: 'Position' },
    { key: 'organisation', label: 'Organisation' },
    { key: 'category', label: 'Group' },
    { key: 'status', label: 'Status', render: badge },
  ],
  importer: {
    columns: ['title', 'organisation', 'category', 'period', 'order', 'description'],
    example: ['Director', 'Theta Tea Factory', 'Business', '2018 to present', '60', 'One line on the role.'],
    // Several roles share a title (e.g. Director), so match on title and organisation.
    key: (d) => `${d.title}|${d.organisation}`,
    map: (r) => ({
      title: String(r.title || r.position || '').trim(),
      organisation: String(r.organisation || r.organization || '').trim(),
      category: POSITION_CATEGORIES.find((c) => c.toLowerCase() === String(r.category || r.group || '').trim().toLowerCase()) || 'Community',
      period: String(r.period || r.when || ''),
      order: Number(r.order) || 50,
      description: String(r.description || ''),
      status: 'published',
    }),
  },
}

export const pressConfig = {
  coll: 'press',
  title: 'News and press',
  blurb: 'Press coverage, statements and events. Each item links to the original article.',
  noun: 'Story',
  empty: { title: '', outlet: '', date: '', url: '', category: NEWS_CATEGORIES[1], summary: '', image: '', status: 'published' },
  fields: [
    { key: 'title', label: 'Headline', required: true, wide: true },
    { key: 'outlet', label: 'Outlet or source' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'category', label: 'Category', type: 'select', options: NEWS_CATEGORIES },
    { key: 'url', label: 'Link to the article', type: 'url' },
    { key: 'summary', label: 'Short summary', type: 'textarea', wide: true },
    { key: 'image', label: 'Photo', type: 'image', wide: true, hint: 'Also appears in the Gallery.' },
    status,
  ],
  columns: [
    { key: 'title', label: 'Headline' },
    { key: 'outlet', label: 'Outlet' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: badge },
  ],
  importer: {
    columns: ['title', 'outlet', 'date', 'url', 'category', 'summary'],
    example: ['Headline here', 'The Standard', '2026-05-12', 'https://example.com/article', 'Press coverage', 'One line summary.'],
    map: (r) => ({
      title: String(r.title || '').trim(),
      outlet: String(r.outlet || ''),
      date: String(r.date || ''),
      url: String(r.url || ''),
      category: NEWS_CATEGORIES.includes(r.category) ? r.category : 'Press coverage',
      summary: String(r.summary || ''),
      image: '',
      status: 'published',
    }),
  },
}

export const galleryConfig = {
  coll: 'gallery',
  title: 'Gallery',
  blurb: 'Standalone photos and videos. Project photos and news photos appear here automatically.',
  noun: 'Item',
  empty: { type: 'photo', title: '', category: GALLERY_CATEGORIES[0], src: '', url: '', status: 'published' },
  fields: [
    { key: 'type', label: 'Type', type: 'select', options: [{ value: 'photo', label: 'Photo' }, { value: 'video', label: 'Video link' }] },
    { key: 'title', label: 'Caption' },
    { key: 'category', label: 'Category', type: 'select', options: GALLERY_CATEGORIES, showIf: (f) => f.type !== 'video' },
    { key: 'src', label: 'Photo', type: 'image', wide: true, showIf: (f) => f.type !== 'video' },
    { key: 'url', label: 'Video link', type: 'url', wide: true, hint: 'YouTube, Google Drive, Facebook or TikTok. YouTube thumbnails are automatic.', showIf: (f) => f.type === 'video' },
    status,
  ],
  columns: [
    { key: 'type', label: 'Type', render: (it) => (it.type === 'video' ? 'Video' : 'Photo') },
    { key: 'title', label: 'Caption' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: badge },
  ],
}

export const profileDefaults = defaults.profile
export const parliamentDefaults = defaults.parliament
export const contactDefaults = defaults.contact
