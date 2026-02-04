import styles from './styles.module.css';

interface CardProps {
  project: Project;
}

interface Project {
  id: number;
  name: string;
  desc: string;
  liveLink: string;
  githubLink: string;
  techs: string[];
  smallImg: string;
  largeImg: string;
}

export default function Card({ project }: CardProps) {
  return (
    <div className={styles.card}>
      <a href={project.liveLink}>
        <picture>
          <source media="(max-width: 799px)" srcSet={project.smallImg} />
          <source media="(min-width: 800px)" srcSet={project.largeImg} />
          <img src={project.largeImg} alt="placeholder" />
        </picture>
      </a>
      <div className={`flow ${styles.card__flow}`}>
        <h3>{project.name}</h3>
        <p>{project.desc}</p>
        <button className={`button__primary`}>
          <a href={project.liveLink}>Check out the Site</a>
        </button>
        {project.githubLink ? (
          <button className={`button__secondary`}>
            <a href={project.githubLink}>Check out the Code</a>
          </button>
        ) : null}
        <details>
          <summary>Featured Tech:</summary>
          <div className={`techs`}>
            {project.techs.map((item, i) => (
              <div key={i} className="body2">
                {item}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
