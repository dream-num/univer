import { BaseColorButtonProps, ColorButtonComponent, JSXComponent } from '@univer/base-component';
import * as Icon from '../Icon';
import { ColorPicker } from '../index';
import styles from './index.module.less';

// type Iprops = {
//     color: string;
// };
export function ColorButton(props: BaseColorButtonProps) {
    const { color } = props;
    return (
        <div className={styles.colorButton}>
            <ColorPicker color={color} onColor={(col, val) => {}} onCancel={() => {}} />
            <Icon.Format.NextIcon />
        </div>
    );
}

export class UniverColorButton implements ColorButtonComponent {
    render(): JSXComponent<BaseColorButtonProps> {
        return ColorButton;
    }
}
