import styles from './pong.module.scss';

/* eslint-disable-next-line */
export interface PongProps {}

export function Pong(props: PongProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Pong!</h1>
    </div>
  );
}

export default Pong;
