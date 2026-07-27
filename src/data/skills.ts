// Icon names resolve at build time via astro-icon; no runtime JS is shipped.
export interface Skill {
  name: string;
  icon: string;
}

export const skills: Skill[] = [
  { name: 'Javascript', icon: 'simple-icons:javascript' },
  { name: 'Python', icon: 'simple-icons:python' },
  { name: 'HTML', icon: 'simple-icons:html5' },
  { name: 'CSS', icon: 'simple-icons:css' },
  { name: 'React', icon: 'simple-icons:react' },
  { name: 'Redux', icon: 'simple-icons:redux' },
  { name: 'Tailwind', icon: 'simple-icons:tailwindcss' },
  { name: 'Mui', icon: 'simple-icons:mui' },
  { name: 'Node JS', icon: 'simple-icons:nodedotjs' },
  { name: 'Express', icon: 'simple-icons:express' },
  { name: 'Mongo', icon: 'simple-icons:mongodb' },
  { name: 'Postgres', icon: 'simple-icons:postgresql' },
  { name: 'Firebase', icon: 'simple-icons:firebase' },
  { name: 'Fly.io', icon: 'simple-icons:flydotio' },
  { name: 'Stripe', icon: 'simple-icons:stripe' },
  { name: 'Typescript', icon: 'simple-icons:typescript' },
  { name: 'Next JS', icon: 'simple-icons:nextdotjs' },
  { name: 'Vite', icon: 'simple-icons:vite' },
  { name: 'Astro', icon: 'simple-icons:astro' },
  { name: 'Bun', icon: 'simple-icons:bun' },
  { name: 'Go', icon: 'simple-icons:go' },
  { name: 'Supabase', icon: 'simple-icons:supabase' },
  { name: 'Docker', icon: 'simple-icons:docker' },
  { name: 'GitHub Actions', icon: 'simple-icons:githubactions' },
  { name: 'OpenAPI', icon: 'simple-icons:openapiinitiative' },
  { name: 'TanStack', icon: 'simple-icons:tanstack' },
  { name: 'React Router', icon: 'simple-icons:reactrouter' },
  { name: 'shadcn/ui', icon: 'simple-icons:shadcnui' },
  { name: 'Hono', icon: 'simple-icons:hono' },
  { name: 'Drizzle', icon: 'simple-icons:drizzle' },
  { name: 'Cloudinary', icon: 'simple-icons:cloudinary' },
  { name: 'Better Auth', icon: 'simple-icons:betterauth' },
  { name: 'Playwright', icon: 'simple-icons:playwright' },
  { name: 'Vitest', icon: 'simple-icons:vitest' },
];
