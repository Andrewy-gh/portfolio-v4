import spruceSm from '../assets/projects/spruce-street-sm.webp';
import spruceLg from '../assets/projects/spruce-street-lg.webp';
import takashiSm from '../assets/projects/takashi-sm.webp';
import takashiLg from '../assets/projects/takashi-lg.webp';
import cutAboveSm from '../assets/projects/cut-above-sm.webp';
import cutAboveLg from '../assets/projects/cut-above-lg.webp';
import fittrackSm from '../assets/projects/fittrack-sm.webp';
import fittrackLg from '../assets/projects/fittrack-lg.webp';
import anicaSm from '../assets/projects/anica-sm.webp';
import anicaLg from '../assets/projects/anica-lg.webp';

export interface Project {
  name: string;
  /** Long-form description, reused verbatim by /index.md and /llms.txt. */
  desc: string;
  liveLink: string;
  githubLink: string;
  techs: string[];
  smallImg: ImageMetadata;
  largeImg: ImageMetadata;
}

export const projects: Project[] = [
  {
    name: 'Fittrack',
    desc: 'Full-stack fitness tracking app with a React + TypeScript UI, TanStack Router/Query/Form, and shadcn/ui on Tailwind. Go API with OpenAPI/Swagger docs, Postgres via Supabase, auth via Stack Auth (open-source), and CI/CD with Docker + GitHub Actions.',
    liveLink: 'https://fittrack.fly.dev/',
    githubLink: 'https://github.com/Andrewy-gh/fittrack',
    techs: [
      'React',
      'Typescript',
      'TanStack Router',
      'TanStack Query',
      'TanStack Form',
      'shadcn/ui',
      'Tailwind CSS',
      'Go',
      'OpenAPI/Swagger',
      'Postgres',
      'Supabase',
      'Stack Auth',
      'Docker',
      'GitHub Actions',
    ],
    smallImg: fittrackSm,
    largeImg: fittrackLg,
  },
  {
    name: 'Anica Buckson',
    desc: "NYC based fashion stylist with work featured in Harper's Bazaar and Vogue magazine with collaborations with brands such as Levi's, New Balance, and Ikea",
    liveLink: 'https://www.anicabuckson.com/',
    githubLink: '',
    techs: ['Closed source'],
    smallImg: anicaSm,
    largeImg: anicaLg,
  },
  {
    name: 'Cut Above Barbershop',
    desc: 'Appointment platform for a barbershop, covering customer booking, rescheduling, cancellations, staff availability, and admin appointment management. The app uses Convex for realtime data and backend functions, Better Auth for sessions, and an email outbox with retry handling for customer notifications.',
    liveLink: 'https://cut-above.vercel.app/',
    githubLink: 'https://github.com/Andrewy-gh/cut-above-barbershop',
    techs: [
      'React',
      'Typescript',
      'Vite',
      'Material UI',
      'Redux Toolkit',
      'Convex',
      'Better Auth',
      'Nodemailer',
      'Mailpit',
      'Playwright',
      'Vitest',
    ],
    smallImg: cutAboveSm,
    largeImg: cutAboveLg,
  },
  {
    name: 'Takashi Photography',
    desc: 'Photography portfolio and admin publishing system for an international photographer. The public site serves Cloudinary-optimized galleries, while a separate dashboard supports signed uploads, image/category management, custom ordering, and session-protected admin access.',
    liveLink: 'https://takashi-photo.vercel.app/',
    githubLink: 'https://github.com/Andrewy-gh/takashi-portfolio-full-stack',
    techs: [
      'React',
      'Typescript',
      'Vite',
      'Material UI',
      'Hono',
      'Postgres',
      'Drizzle',
      'Supabase',
      'Cloudinary',
      'TanStack Router',
      'TanStack Query',
      'TanStack Form',
      'shadcn/ui',
      'Playwright',
    ],
    smallImg: takashiSm,
    largeImg: takashiLg,
  },
  {
    name: 'Spruce Street',
    desc: 'Web page for a local plant store.',
    liveLink: 'https://spruce-street.netlify.app/',
    githubLink: 'https://github.com/Andrewy-gh/spruce-street',
    techs: ['React', 'Typescript', 'Tailwind CSS', 'Vite'],
    smallImg: spruceSm,
    largeImg: spruceLg,
  },
];
