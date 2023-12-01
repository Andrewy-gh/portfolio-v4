import { ReactNode } from 'react';
import {
  SiJavascript,
  SiPython,
  SiHtml5,
  SiCss3,
  SiReact,
  SiRedux,
  SiTailwindcss,
  SiMui,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiPostgresql,
  SiFirebase,
  SiTypescript,
  SiNextdotjs,
} from 'react-icons/si';
import { FaFly } from 'react-icons/fa';

interface Skill {
  id: number;
  name: string;
  icon: ReactNode;
}

export const skills: Skill[] = [
  { id: 1, name: 'Javascript', icon: <SiJavascript /> },
  { id: 2, name: 'Python', icon: <SiPython /> },
  { id: 3, name: 'HTML', icon: <SiHtml5 /> },
  { id: 4, name: 'CSS', icon: <SiCss3 /> },
  { id: 5, name: 'React', icon: <SiReact /> },
  { id: 6, name: 'Redux', icon: <SiRedux /> },
  { id: 7, name: 'Tailwind', icon: <SiTailwindcss /> },
  { id: 8, name: 'Mui', icon: <SiMui /> },
  { id: 9, name: 'Node JS', icon: <SiNodedotjs /> },
  { id: 10, name: 'Express', icon: <SiExpress /> },
  { id: 11, name: 'Mongo', icon: <SiMongodb /> },
  { id: 12, name: 'Postgres', icon: <SiPostgresql /> },
  { id: 13, name: 'Firebase', icon: <SiFirebase /> },
  { id: 14, name: 'Fly.io', icon: <FaFly /> },
  { id: 15, name: 'Typescript', icon: <SiTypescript /> },
  { id: 16, name: 'Next JS', icon: <SiNextdotjs /> },
];
