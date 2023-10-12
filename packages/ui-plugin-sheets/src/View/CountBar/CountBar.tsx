import { Button, Icon, Slider } from '@univerjs/base-ui';
import { useState } from 'react';

import styles from './index.module.less';

interface ICountBarProps {
    changeRatio?: (ratio: string) => void;
    onChange?: (value: string) => void;
}

const ZOOM_MAP = [50, 75, 100, 125, 150, 175, 200, 400];

export function CountBar(props: ICountBarProps) {
    const [zoom, setZoom] = useState(100);

    function handleChange(value: number) {
        setZoom(value);

        // TODO: changeRatio, onChange
    }

    return (
        <section className={styles.countBar}>
            <Button>
                <Icon.Sheet.RegularIcon />
            </Button>
            <Slider value={zoom} shortcuts={ZOOM_MAP} onChange={handleChange} />
        </section>
    );
}
