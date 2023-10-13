import { Button, Icon } from '@univerjs/base-ui';

import styles from './index.module.less';
import { ZoomSlider } from './zoom-slider';

interface ICountBarProps {
    changeRatio?: (ratio: string) => void;
    onChange?: (value: string) => void;
}

export function CountBar(props: ICountBarProps) {
    return (
        <section className={styles.countBar}>
            <Button>
                <Icon.Sheet.RegularIcon />
            </Button>
            <ZoomSlider />
        </section>
    );
}
