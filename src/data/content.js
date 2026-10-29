// Built-in content, taken from the Parliament of Kenya, Mzalendo and news reports.
// The dashboard (Firebase) overrides any of this once the office saves its own version.

export const CATEGORIES = ['Education', 'Tea and agriculture', 'Roads and water', 'Housing', 'Health', 'Youth and sports', 'Other']
export const NEWS_CATEGORIES = ['Parliament', 'Press coverage', 'Statements', 'Events']
export const GALLERY_CATEGORIES = ['Parliament', 'Constituency', 'Events', 'Tea sector', 'Community']
export const POSITION_CATEGORIES = ['Parliament', 'Boards', 'Business', 'Community']

export const defaults = {
  profile: {
    name: 'Hon. Gabriel Gathuka Kagombe',
    officialName: 'Kagombe Gabriel Gathuka',
    title: 'Member of Parliament for Gatundu South',
    party: 'Democracy for Citizens Party (DCP)',
    elected: 'August 2022',
    parliament: '13th Parliament of Kenya',
    intro:
      'A University of Nairobi graduate in economics and communication, a tea-sector director and a local board chairman, now serving Gatundu South in the National Assembly on the Agriculture and Public Accounts committees.',
    bio: [
      'Hon. Gabriel Gathuka Kagombe is the Member of Parliament for Gatundu South in Kiambu County. He was elected in August 2022 with 17,815 votes and serves in the 13th Parliament of Kenya. In August 2026 he left the United Democratic Alliance, on whose ticket he was elected, and joined the Democracy for Citizens Party.',
      'He holds a Bachelor of Arts in Economics and Communication from the University of Nairobi. Outside Parliament he chairs the board of Highlands Power Company, is a board member of the Kiambu County Biashara Fund, chairs the Board of Management of Mutunguru Primary School and is a director of Theta Tea Factory and Ndarugu Tea Factory. His interests are public service, public administration and strategic leadership and development.',
    ],
    vision: '',
    photo: '',
    interests: ['Public service', 'Public administration', 'Strategic leadership', 'Agriculture and livestock', 'Tea sector', 'Public accounts'],
    focus: [
      {
        title: 'Tea and farmers',
        text: 'Member of the Agriculture and Livestock Committee, with contributions in the House on the small-scale tea sector, tea pricing and fertiliser subsidies.',
      },
      {
        title: 'Public accounts',
        text: 'Member of the Public Accounts Committee, which follows how public money is spent and reported.',
      },
      {
        title: 'Education and bursaries',
        text: 'Reported to have disbursed Sh64 million in NG-CDF bursaries to about 7,500 students in Gatundu South.',
      },
      {
        title: 'Local development',
        text: 'Spoke at the launch of the Ksh1.3 billion affordable housing project in Gatundu, planned for about 500 units.',
      },
    ],
    timeline: [
      { when: 'August 2026', title: 'Joined the Democracy for Citizens Party', detail: 'Announced his departure from UDA on 11 August 2026, according to press reports.' },
      { when: '2022', title: 'Elected Member of Parliament for Gatundu South', detail: '17,815 votes on a United Democratic Alliance ticket (IEBC Gazette Notice 9950). Sworn in to the 13th Parliament.' },
      { when: 'Current', title: 'Boards and directorships', detail: 'Chairman, Highlands Power Company. Board member, Biashara Fund, Kiambu County. Director, Theta Tea Factory and Ndarugu Tea Factory.' },
      { when: 'Current', title: 'Chairman, Board of Management', detail: 'Mutunguru Primary School.' },
    ],
    education: [
      { when: '2004 to 2008', title: 'Bachelor of Arts, Economics and Communication', detail: 'University of Nairobi' },
      { when: '1999 to 2002', title: 'KCSE', detail: 'Mururia Secondary School' },
    ],
  },
  parliament: {
    stats: [
      { value: 47, label: 'Contributions in the House' },
      { value: 4, label: 'Motions' },
      { value: 4, label: 'Questions' },
      { value: 1, label: 'Statement requests' },
      { value: 25, label: 'Committee reports' },
      { value: 6, label: 'Recorded votes' },
    ],
    votes: { aye: 4, no: 0, absent: 2 },
    committees: [
      { name: 'Agriculture and Livestock', role: 'Member', note: 'Reports include the tea pricing inquiry, the Plant Protection Bill and the Coffee Bill.' },
      { name: 'Public Accounts', role: 'Member', note: '' },
    ],
    bills: [
      { title: 'The Finance Bill, 2023 (Second Reading)', year: '2023', status: 'Voted Aye' },
      { title: 'The Finance Bill, 2024 (Second Reading)', year: '2024', status: 'Voted Aye' },
      { title: 'The Finance Bill, 2024 (Committee of the Whole report)', year: '2024', status: 'Voted Aye' },
      { title: 'The Constitution of Kenya (Amendment) Bill, 2025', year: '2025', status: 'Absent' },
    ],
    billsNote: 'Mzalendo records no Bills sponsored by the Member in the 13th Parliament so far. This table lists the Bill votes it records.',
    motions: [
      { date: '25 Apr 2023', title: 'Appointment of an external auditor for the Auditor-General’s Office', outcome: 'Moved and seconded' },
      { date: '2 Mar 2023', title: 'Extension of time for the Budget Policy Statement', outcome: 'Adopted' },
      { date: '23 Feb 2023', title: 'Approval of appointments to a body under the Parliamentary Powers and Privileges Act', outcome: 'Adopted' },
      { date: '1 Dec 2022', title: 'Agriculture Committee report on the vetting of Principal Secretary nominees', outcome: 'Adopted' },
    ],
    questions: [
      { date: '10 Aug 2023', title: 'Delayed NYS disbursement of Ksh 2 billion', to: 'Treasury CS', status: 'Pending' },
      { date: '26 Jun 2023', title: 'Safaricom and VoIP operators', to: 'ICT CS', status: 'Pending' },
      { date: '7 Jun 2023', title: 'Autism and equal access to education', to: 'Education CS', status: 'Deferred' },
      { date: '', title: 'Recruitment bonds for migrant workers', to: 'Labour CS', status: 'Pending' },
    ],
    source: 'Figures from Mzalendo (13th Parliament) and the Parliament of Kenya. The office updates them from the dashboard.',
  },
  contact: {
    office: '',
    parliament: 'Parliament Buildings, Nairobi',
    email: '',
    phone: '',
    social: [
      { label: 'Facebook', url: 'https://www.facebook.com/GGkagombeMpGatunduSouth/' },
      { label: 'X', url: 'https://x.com/GGKagombe' },
      { label: 'Instagram', url: 'https://www.instagram.com/ggkagombe/' },
      { label: 'LinkedIn', url: 'https://ke.linkedin.com/in/hon-gg-kagombe-52b76318' },
    ],
    links: [
      { label: 'Parliament of Kenya profile', url: 'https://www.parliament.go.ke/the-national-assembly/hon-kagombe-gabriel-gathuka' },
      { label: 'Mzalendo record', url: 'https://mzalendo.com/mps-performance/national-assembly/13th-parliament/kagombe-gabriel-gathuka/' },
      { label: 'Gatundu South NG-CDF', url: 'https://gatundu-south.ngcdf.go.ke/' },
    ],
  },
  positions: [
    { id: 'mp', title: 'Member of Parliament, Gatundu South', organisation: 'National Assembly of Kenya', category: 'Parliament', period: '2022 to present', description: 'Elected August 2022 and serving in the 13th Parliament.' },
    { id: 'agri', title: 'Member, Agriculture and Livestock Committee', organisation: 'National Assembly of Kenya', category: 'Parliament', period: 'Current', description: 'Reports include the tea pricing inquiry, the Plant Protection Bill and the Coffee Bill.' },
    { id: 'pac', title: 'Member, Public Accounts Committee', organisation: 'National Assembly of Kenya', category: 'Parliament', period: 'Current', description: 'Examines the audited accounts of national government.' },
    { id: 'highlands', title: 'Chairman of the Board', organisation: 'Highlands Power Company', category: 'Boards', period: 'Current', description: '' },
    { id: 'biashara', title: 'Board Member', organisation: 'Biashara Fund, Kiambu County', category: 'Boards', period: 'Current', description: 'The county’s enterprise fund.' },
    { id: 'theta', title: 'Director', organisation: 'Theta Tea Factory', category: 'Business', period: 'Current', description: '' },
    { id: 'ndarugu', title: 'Director', organisation: 'Ndarugu Tea Factory', category: 'Business', period: 'Current', description: '' },
    { id: 'mutunguru', title: 'Chairman, Board of Management', organisation: 'Mutunguru Primary School', category: 'Community', period: 'Current', description: '' },
  ],
  projects: [
    {
      id: 'ngcdf-bursaries',
      title: 'NG-CDF bursaries for students',
      category: 'Education',
      year: '',
      ward: 'Gatundu South',
      amount: 64000000,
      description: 'Press reports say the MP handed out bursary cheques while disbursing Sh64 million in NG-CDF funds to about 7,500 students, easing the burden of school fees on parents. The office will confirm the date and details.',
      photos: [],
    },
    {
      id: 'gatundu-housing',
      title: 'Gatundu affordable housing project',
      category: 'Housing',
      year: '',
      ward: 'Gatundu South',
      amount: 1300000000,
      description: 'A planned Ksh1.3 billion project of about 500 affordable housing units, expected to take 18 months and create jobs for more than 1,000 young people. The MP spoke at the launch. Delivery is by the national government.',
      photos: [],
    },
  ],
  press: [
    {
      id: 'dcp-switch',
      title: 'Kagombe on DCP switch: “I came here as Saul, but now I have become Paul”',
      outlet: 'The Standard',
      date: '2026-08-18',
      url: 'https://thestandard.ke/business/amp/central/article/2001555614/kagombe-on-dcp-switch-i-came-here-as-saul-but-now-i-have-become-paul',
      image: '',
      category: 'Press coverage',
      summary: 'The Gatundu South MP explains his move to the Democracy for Citizens Party.',
    },
    {
      id: 'tea-roads',
      title: 'Gatundu South MP cuts ties with UDA over roads, tea farmers’ woes',
      outlet: 'Kenyans.co.ke',
      date: '2026-08-12',
      url: 'https://www.kenyans.co.ke/news/126113-gatundu-south-mp-kagombe-cuts-ties-uda-over-roads-tea-farmers-woes',
      image: '',
      category: 'Press coverage',
      summary: 'He raised the state of local roads, the proposed tea export levy and unpaid fertiliser subsidy reimbursements.',
    },
    {
      id: 'bursaries',
      title: 'Reprieve for 7,500 Gatundu South students as MP Kagombe disburses Sh64 million bursaries',
      outlet: 'Education News',
      date: '',
      url: 'https://educationnews.co.ke/?p=517244',
      image: '',
      category: 'Press coverage',
      summary: 'NG-CDF bursaries reach thousands of students in the constituency.',
    },
    {
      id: 'housing',
      title: 'State set to spend Ksh1.3 billion to build affordable houses in Gatundu South',
      outlet: 'People Daily',
      date: '',
      url: 'https://peopledaily.digital/news/state-set-to-spend-ksh1-3-billion-to-build-affordable-houses-in-gatundu-south',
      image: '',
      category: 'Press coverage',
      summary: 'About 500 units are planned. The MP spoke at the launch.',
    },
  ],
  gallery: [],
}
