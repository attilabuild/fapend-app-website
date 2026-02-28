export type ClientStage = "Onboarding" | "Active" | "At Risk" | "Completed";
export type ClientStatus = "Online" | "In Person" | "Hybrid";

export interface CoachService {
  id: string;
  title: string;
  description: string;
  price?: string;
  delivery?: string; // e.g. "4-week programme"
}

export interface CoachReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  role?: string; // e.g. "Entrepreneur"
}

export interface MockCoach {
  id: string;
  slug: string;
  name: string;
  email: string;
  bio: string;
  coachingType: string;
  website?: string;
  timezone: string;
  /** Optional Fiverr-style profile fields */
  avatarUrl?: string;
  tagline?: string;
  location?: string;
  languages?: string[];
  responseTime?: string;
  memberSince?: string;
  rating?: number;
  reviewCount?: number;
  services?: CoachService[];
  reviews?: CoachReview[];
}

export const MOCK_COACH: MockCoach = {
  id: "coach-1",
  slug: "alex-morgan",
  name: "Alex Morgan",
  email: "alex@example.com",
  bio: "I help coaches and entrepreneurs build sustainable client systems. 10+ years in 1:1 and group coaching. My focus is on clarity, accountability, and systems that scale so you can serve more clients without burning out.",
  coachingType: "Business & Mindset Coach",
  website: "https://alexmorgan.co",
  timezone: "America/New_York",
  tagline: "From chaos to clarity — build a coaching business that runs without you",
  location: "New York, USA",
  languages: ["English"],
  responseTime: "Usually responds in 2 hours",
  memberSince: "2024",
  rating: 4.9,
  reviewCount: 47,
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  services: [
    { id: "s1", title: "1:1 Business Coaching (4 weeks)", description: "Weekly 1:1 calls, custom action plan, and accountability. Ideal for coaches and consultants ready to systemise and scale.", price: "From £800", delivery: "4-week programme" },
    { id: "s2", title: "8-Week Group Programme", description: "Live group coaching with weekly sessions, worksheets, and a private community. Perfect for solopreneurs building their first offer.", price: "From £497", delivery: "8 weeks" },
    { id: "s3", title: "High-Ticket Mentorship (12 weeks)", description: "Deep-dive mentorship for established coaches. Strategy, positioning, and implementation support.", price: "From £2,400", delivery: "12 weeks" },
  ],
  reviews: [
    { id: "r1", author: "Sarah M.", rating: 5, text: "Alex helped me go from scattered to a clear offer and client system. Best investment I've made in my business.", date: "2 weeks ago", role: "Life Coach" },
    { id: "r2", author: "James K.", rating: 5, text: "Professional, structured, and genuinely cares. The 8-week programme was exactly what I needed to get my first paying clients.", date: "1 month ago", role: "Consultant" },
    { id: "r3", author: "Elena R.", rating: 5, text: "Worth every penny. I now have a simple flow for onboarding and follow-up. My clients love the clarity.", date: "2 months ago", role: "Fitness Coach" },
  ],
};

/** 100 different coaching types for browse/filter. */
const COACH_TYPES = [
  "Business & Mindset Coach",
  "Fitness & Nutrition Coach",
  "Career & Leadership Coach",
  "Life Coach",
  "Executive Coach",
  "Health & Wellness Coach",
  "Performance Coach",
  "Mindset Coach",
  "Leadership Coach",
  "Career Coach",
  "Business Coach",
  "Success Coach",
  "Confidence Coach",
  "Relationship Coach",
  "Parenting Coach",
  "Spiritual Coach",
  "Financial Coach",
  "Sales Coach",
  "Marketing Coach",
  "Productivity Coach",
  "Time Management Coach",
  "Stress & Burnout Coach",
  "Anxiety & Confidence Coach",
  "Weight Loss Coach",
  "Running Coach",
  "Strength & Conditioning Coach",
  "Yoga & Mindfulness Coach",
  "Meditation Coach",
  "Habit Coach",
  "Goal-Setting Coach",
  "Accountability Coach",
  "High-Ticket Coach",
  "Entrepreneur Mentor",
  "Startup Coach",
  "Small Business Coach",
  "Executive Leadership Coach",
  "Team Coach",
  "Communication Coach",
  "Public Speaking Coach",
  "Presentation Coach",
  "Conflict Resolution Coach",
  "Negotiation Coach",
  "Women in Leadership Coach",
  "Tech Career Coach",
  "Creative Director Coach",
  "Design Coach",
  "Content Creator Coach",
  "Social Media Coach",
  "Personal Brand Coach",
  "Transition Coach",
  "Retirement Coach",
  "Career Change Coach",
  "Interview Coach",
  "CV & Resume Coach",
  "Networking Coach",
  "PhD & Academic Coach",
  "Student Success Coach",
  "ADHD Coach",
  "Neurodiversity Coach",
  "Chronic Illness Coach",
  "Recovery Coach",
  "Addiction Recovery Coach",
  "Grief Coach",
  "Trauma-Informed Coach",
  "Fertility Coach",
  "Pregnancy & Postpartum Coach",
  "Menopause Coach",
  "Hormone Health Coach",
  "Sleep Coach",
  "Gut Health Coach",
  "Plant-Based Nutrition Coach",
  "Sports Nutrition Coach",
  "Eating Disorder Recovery Coach",
  "Body Image Coach",
  "Intuitive Eating Coach",
  "Marathon Coach",
  "Triathlon Coach",
  "CrossFit Coach",
  "Personal Trainer & Coach",
  "Reiki & Energy Coach",
  "Manifestation Coach",
  "Law of Attraction Coach",
  "Feminine Empowerment Coach",
  "Men's Coach",
  "Teen Coach",
  "Youth Coach",
  "Senior Coach",
  "Expat Coach",
  "Relocation Coach",
  "Dating Coach",
  "Singles Coach",
  "Marriage Coach",
  "Divorce Coach",
  "Co-Parenting Coach",
  "Blended Family Coach",
  "Special Needs Parenting Coach",
  "Homeschool Coach",
  "Study Skills Coach",
  "Test Prep Coach",
  "Writing Coach",
  "Author Coach",
  "Artist Coach",
  "Musician Coach",
  "Actor Coach",
  "Real Estate Coach",
  "Property Coach",
  "Investment Coach",
  "Trading Coach",
  "Side Hustle Coach",
  "Freelance Coach",
  "Remote Work Coach",
  "Work-Life Balance Coach",
  "Boundary-Setting Coach",
  "Assertiveness Coach",
  "Self-Esteem Coach",
  "Imposter Syndrome Coach",
  "Authenticity Coach",
  "Purpose & Meaning Coach",
  "Legacy Coach",
  "Retreat & Transformation Coach",
] as const;

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
];

const SAMPLE_LOCATIONS = ["New York, USA", "London, UK", "Berlin, Germany", "Sydney, Australia", "Toronto, Canada", "Amsterdam, Netherlands", "Paris, France", "Singapore", "Austin, USA", "Melbourne, Australia"];

const FIRST_NAMES = ["Alex", "Jordan", "Sam", "Morgan", "Taylor", "Casey", "Riley", "Quinn", "Jamie", "Drew", "Skyler", "Reese", "Avery", "Parker", "Blake", "Cameron", "Jordan", "Finley", "Sage", "River"];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Generate additional coaches so we have one per coaching type (100 types). */
function generateCoachesByType(): MockCoach[] {
  return COACH_TYPES.map((coachingType, i) => {
    const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${coachingType.split(" ")[0]}`;
    const baseSlug = slugify(coachingType);
    const slug = `${baseSlug}-${i + 1}`;
    const rating = 4 + ((i * 7) % 10) / 10;
    const reviewCount = 8 + (i * 11) % 85;
    return {
      id: `coach-gen-${i + 1}`,
      slug,
      name,
      email: `${slug}@example.com`,
      bio: `Professional ${coachingType.toLowerCase()}. I help clients achieve their goals with personalised support and proven frameworks.`,
      coachingType,
      timezone: "Europe/London",
      tagline: `Expert ${coachingType.toLowerCase()} — book a session and start your journey.`,
      location: SAMPLE_LOCATIONS[i % SAMPLE_LOCATIONS.length],
      languages: ["English"],
      responseTime: "Usually responds within 24 hours",
      memberSince: "2024",
      rating,
      reviewCount,
      avatarUrl: SAMPLE_AVATARS[i % SAMPLE_AVATARS.length],
    };
  });
}

/** All coaches for browse page: 3 featured + 100 by type. */
export const MOCK_COACHES: MockCoach[] = [
  MOCK_COACH,
  {
    id: "coach-2",
    slug: "jordan-lee",
    name: "Jordan Lee",
    email: "jordan@example.com",
    bio: "Fitness and nutrition coach helping busy professionals build sustainable habits. NASM certified, 5+ years experience.",
    coachingType: "Fitness & Nutrition Coach",
    website: "https://jordanleecoaching.com",
    timezone: "Europe/London",
    tagline: "Get strong, eat well, stay consistent — no guilt, no fads",
    location: "London, UK",
    languages: ["English"],
    responseTime: "Usually responds in 5 hours",
    memberSince: "2024",
    rating: 4.8,
    reviewCount: 32,
    avatarUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
    services: [
      { id: "s1", title: "12-Week Transformation", description: "Personalised training and nutrition plan with weekly check-ins and habit coaching.", price: "From £600", delivery: "12 weeks" },
      { id: "s2", title: "1:1 Session Pack (4 sessions)", description: "Four focused 1:1 sessions to kickstart or reset your routine.", price: "From £280", delivery: "4 sessions" },
    ],
    reviews: [
      { id: "r1", author: "Mike T.", rating: 5, text: "Jordan kept me accountable and the results were real. No nonsense, just solid advice.", date: "3 weeks ago", role: "Client" },
    ],
  },
  {
    id: "coach-3",
    slug: "sam-rivera",
    name: "Sam Rivera",
    email: "sam@example.com",
    bio: "Career and leadership coach for mid-level professionals and new managers. Ex-FAANG, now helping you lead with clarity.",
    coachingType: "Career & Leadership Coach",
    website: "https://samrivera.co",
    timezone: "America/Los_Angeles",
    tagline: "Lead better, get promoted, and actually enjoy work",
    location: "San Francisco, USA",
    languages: ["English", "Spanish"],
    responseTime: "Usually responds in 1 hour",
    memberSince: "2024",
    rating: 5,
    reviewCount: 18,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    services: [
      { id: "s1", title: "Leadership Sprint (6 weeks)", description: "For new or aspiring managers. Six 1:1 sessions plus frameworks and scripts you can use immediately.", price: "From $900", delivery: "6 weeks" },
    ],
    reviews: [
      { id: "r1", author: "Priya S.", rating: 5, text: "Sam helped me prepare for my first management role. Clear, direct, and really knows the corporate world.", date: "1 month ago", role: "Tech Lead" },
    ],
  },
  ...generateCoachesByType(),
];

/** Resolve coach by public slug (for public profile page). */
export function getCoachBySlug(slug: string): MockCoach | undefined {
  return MOCK_COACHES.find((c) => c.slug === slug);
}

/** Get all coaches (for browse page). */
export function getCoaches(): MockCoach[] {
  return MOCK_COACHES;
}

export interface MockClient {
  id: string;
  name: string;
  programName: string;
  stage: ClientStage;
  status: ClientStatus;
  gender?: string;
  lastCheckIn: string;
  lastActive: string;
  duration: string;
  stuck?: boolean;
  nextTask?: string;
  email?: string;
  currentStep?: number;
  totalSteps?: number;
  daysInactive?: number;
}

export interface MockFlowStep {
  id: string;
  title: string;
  type: "welcome" | "task" | "milestone" | "checkin" | "feedback";
  copy?: string;
}

export interface MockFlow {
  id: string;
  title: string;
  description: string;
  stepCount: number;
  steps: MockFlowStep[];
}

export interface MockTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

export const MOCK_CLIENTS: MockClient[] = [
  {
    id: "1",
    name: "Sarah Chen",
    programName: "8-Week Business Accelerator",
    stage: "Onboarding",
    status: "Online",
    gender: "F",
    lastCheckIn: "2 days ago",
    lastActive: "1 hour ago",
    duration: "Week 2 of 8",
    stuck: false,
    nextTask: "Complete intake form",
    currentStep: 2,
    totalSteps: 5,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    programName: "1:1 High-Ticket Mentorship",
    stage: "Active",
    status: "In Person",
    gender: "M",
    lastCheckIn: "Yesterday",
    lastActive: "3 hours ago",
    duration: "Week 4 of 12",
    stuck: false,
    nextTask: "Week 3 check-in",
    currentStep: 4,
    totalSteps: 6,
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    programName: "12-Week Mindset Program",
    stage: "At Risk",
    status: "Hybrid",
    gender: "F",
    lastCheckIn: "5 days ago",
    lastActive: "5 days ago",
    duration: "Week 2 of 12",
    stuck: true,
    nextTask: "Submit Week 2 reflection",
    currentStep: 2,
    totalSteps: 8,
    daysInactive: 5,
  },
  {
    id: "4",
    name: "David Park",
    programName: "1:1 Coaching Onboarding",
    stage: "Onboarding",
    status: "Online",
    gender: "M",
    lastCheckIn: "—",
    lastActive: "2 days ago",
    duration: "Week 1 of 5",
    stuck: false,
    nextTask: "Schedule intro call",
    currentStep: 1,
    totalSteps: 5,
  },
  {
    id: "5",
    name: "Jess Williams",
    programName: "8-Week Fitness Program",
    stage: "Completed",
    status: "Hybrid",
    gender: "F",
    lastCheckIn: "1 week ago",
    lastActive: "3 days ago",
    duration: "Finished",
    stuck: false,
    nextTask: "Final feedback",
    currentStep: 6,
    totalSteps: 6,
  },
];

export const MOCK_MESSAGES = [
  { id: "1", from: "Sarah Chen", text: "Completed my intake form! Ready for our call.", time: "10m ago" },
  { id: "2", from: "Elena Rodriguez", text: "Having trouble with the reflection questions...", time: "1h ago" },
  { id: "3", from: "Marcus Johnson", text: "Week 3 goals uploaded. Let me know your thoughts.", time: "2h ago" },
];

export const MOCK_FLOWS: MockFlow[] = [
  {
    id: "1",
    title: "1:1 Coaching Onboarding Flow",
    description: "Welcome new 1:1 clients, collect intake info, and get them started.",
    stepCount: 5,
    steps: [
      { id: "s1", title: "Welcome message", type: "welcome", copy: "Welcome! Here’s what to expect…" },
      { id: "s2", title: "Intro task / intake form", type: "task", copy: "Please complete the intake questionnaire." },
      { id: "s3", title: "Milestone 1: Schedule intro call", type: "milestone" },
      { id: "s4", title: "Milestone 2: First session prep", type: "milestone" },
      { id: "s5", title: "Weekly check-in", type: "checkin" },
    ],
  },
  {
    id: "2",
    title: "8–12 Week Program Flow",
    description: "Structured program with milestones and weekly check-ins.",
    stepCount: 7,
    steps: [
      { id: "s1", title: "Welcome message", type: "welcome", copy: "Welcome to the program!" },
      { id: "s2", title: "Intro task", type: "task", copy: "Set your goals for this program." },
      { id: "s3", title: "Milestone 1: Week 1–2", type: "milestone" },
      { id: "s4", title: "Milestone 2: Week 3–4", type: "milestone" },
      { id: "s5", title: "Milestone 3: Week 5–6", type: "milestone" },
      { id: "s6", title: "Weekly check-in", type: "checkin" },
      { id: "s7", title: "Final feedback", type: "feedback", copy: "How was the program?" },
    ],
  },
  {
    id: "3",
    title: "High-Ticket Mentorship Flow",
    description: "Premium experience with focused milestones and personal touchpoints.",
    stepCount: 6,
    steps: [
      { id: "s1", title: "Welcome message", type: "welcome", copy: "Welcome to your mentorship journey." },
      { id: "s2", title: "Intro task", type: "task", copy: "Complete your discovery form." },
      { id: "s3", title: "Milestone 1: Foundation", type: "milestone" },
      { id: "s4", title: "Milestone 2: Growth", type: "milestone" },
      { id: "s5", title: "Milestone 3: Breakthrough", type: "milestone" },
      { id: "s6", title: "Final feedback", type: "feedback", copy: "Share your experience." },
    ],
  },
];

export const MOCK_TASKS: Record<string, MockTask[]> = {
  "1": [
    { id: "t1", title: "Complete intake form", completed: true },
    { id: "t2", title: "Schedule intro call", completed: false },
    { id: "t3", title: "Prep for first session", completed: false },
  ],
  "2": [
    { id: "t1", title: "Week 2 reflection", completed: true },
    { id: "t2", title: "Week 3 check-in", completed: false },
  ],
  "3": [
    { id: "t1", title: "Week 1 intake", completed: true },
    { id: "t2", title: "Submit Week 2 reflection", completed: false },
  ],
  "4": [
    { id: "t1", title: "Schedule intro call", completed: false },
  ],
  "5": [
    { id: "t1", title: "Final feedback", completed: true },
  ],
};

export const MOCK_ANALYTICS = {
  completionRateByClient: [
    { name: "Sarah Chen", rate: 40 },
    { name: "Marcus Johnson", rate: 67 },
    { name: "Elena Rodriguez", rate: 25 },
    { name: "David Park", rate: 20 },
    { name: "Jess Williams", rate: 100 },
  ],
  avgOnboardingDays: 12,
  dropOffSteps: [
    { step: "Intro task", count: 3 },
    { step: "Milestone 1", count: 2 },
  ],
  inactiveClients: [
    { name: "Elena Rodriguez", days: 5 },
  ],
};
