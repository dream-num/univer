import styles from './index.module.less';
import { SmartButton } from './SmartButton';

export const OperateContainer: React.FC = () => (
    <div className={styles.operateContainer}>
        <SmartButton></SmartButton>
    </div>
);
