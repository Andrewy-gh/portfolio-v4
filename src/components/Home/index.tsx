import styles from './styles.module.css';
import TypeWriterEffect from 'react-typewriter-effect';
import swd from '../../assets/Software-Developer.svg';

export default function Home() {
  return (
    <div className={styles.grid__container}>
      <div className={styles.text}>
        <h1>
          <span>Hi, I'm Andy</span>
          <span className={styles.wave}>👋🏻</span>
        </h1>
        <TypeWriterEffect
          textStyle={{
            fontSize: '1.5rem',
          }}
          cursorColor="#1da1f2"
          multiText={[
            'Software Engineer',
            'Welcome to my portfolio',
            'Feel free to explore',
          ]}
          multiTextLoop={true}
          multiTextDelay={1500}
          typeSpeed={35}
        />
      </div>
      <div>
        <img src={swd} alt="software developer illustration" />
      </div>
    </div>
  );
}
