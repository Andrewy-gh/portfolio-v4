import spruceSm from "../assets/projects/spruce-street-sm.webp";
import spruceLg from "../assets/projects/spruce-street-lg.webp";
import takashiSm from "../assets/projects/takashi-sm.webp";
import takashiLg from "../assets/projects/takashi-lg.webp";
import cutAboveSm from "../assets/projects/cut-above-sm.webp";
import cutAboveLg from "../assets/projects/cut-above-lg.webp";
import fittrackSm from "../assets/projects/fittrack-sm.webp";
import fittrackLg from "../assets/projects/fittrack-lg.webp";
import anicaSm from "../assets/projects/anica-sm.webp";
import anicaLg from "../assets/projects/anica-lg.webp";

export const projects = [
  {
    id: 1,
    name: "Fittrack",
    desc: "Full-stack fitness tracking app with a React + TypeScript UI, TanStack Router/Query/Form, and shadcn/ui on Tailwind. Go API with OpenAPI/Swagger docs, Postgres via Supabase, auth via Stack Auth (open-source), and CI/CD with Docker + GitHub Actions.",
    liveLink: "https://fittrack.fly.dev/",
    githubLink: "https://github.com/Andrewy-gh/fittrack",
    techs: [
      "React",
      "Typescript",
      "TanStack Router",
      "TanStack Query",
      "TanStack Form",
      "shadcn/ui",
      "Tailwind CSS",
      "Go",
      "OpenAPI/Swagger",
      "Postgres",
      "Supabase",
      "Stack Auth",
      "Docker",
      "GitHub Actions",
    ],
    smallImg: fittrackSm,
    largeImg: fittrackLg,
  },
  {
    id: 2,
    name: "Anica Buckson",
    desc: "NYC based fashion stylist with work featured in Harper's Bazaar and Vogue magazine with collaborations with brands such as Levi's, New Balance, and Ikea",
    liveLink: "https://www.anicabuckson.com/",
    githubLink: "",
    techs: ["Closed source"],
    smallImg: anicaSm,
    largeImg: anicaLg,
  },
  {
    id: 3,
    name: "Cut Above Barbershop",
    desc: "Barbershop web page. Features booking of appointments, user account registration, appointment modification, and email services. Previously, Authentication secured by JWT. Currently authentication is handled by cookie based sessions. Material UI components. Redux for state management and data fetching. Redis for pub/sub handling of email  services.",
    liveLink: "http://cutabove.fly.dev",
    githubLink: "https://github.com/Andrewy-gh/cut-above-barbershop",
    techs: [
      "React",
      "Node",
      "Express",
      "Postgres",
      "Material UI",
      "Vite",
      "Redis",
      "Joi",
      "Node Mailer",
    ],
    smallImg: cutAboveSm,
    largeImg: cutAboveLg,
  },
  {
    id: 4,
    name: "Takashi Photography",
    desc: "A Portfolio site for an international photographer. Drag and drop images for organization. Images optimized via Cloudinary CDN. Authentication secured by JWT.",
    liveLink: "https://takashi-photos.fly.dev",
    githubLink: "https://github.com/Andrewy-gh//takashi-portfolio-full-stack",
    techs: [
      "React",
      "Node",
      "Express",
      "MongoDB",
      "Vite",
      "Material UI",
      "Cloudinary",
      "React Beautiful DND",
      "JSON Web Token",
    ],
    smallImg: takashiSm,
    largeImg: takashiLg,
  },
  {
    id: 5,
    name: "Spruce Street",
    desc: "Web page for a local plant store.",
    liveLink: "https://spruce-street.netlify.app",
    githubLink: "https://github.com/Andrewy-gh/spruce-street",
    techs: ["React", "Typescript", "Tailwind CSS", "Vite"],
    smallImg: spruceSm,
    largeImg: spruceLg,
  },
];
