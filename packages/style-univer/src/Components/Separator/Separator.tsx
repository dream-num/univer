import styles from './index.module.less';

interface IProps {
    mode: boolean;
}

const Separator = (props: IProps) => {
    const { mode } = props;

    return <div className={`${styles.line} ${mode ? styles.vertical : ''}`}></div>;
};

export { Separator };
