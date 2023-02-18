import { JSXComponent } from '../../BaseComponent';
import { BaseColorButtonProps, ColorButtonComponent } from '../../Interfaces';
import { ColorPicker } from '../ColorPicker';
import * as Icon from '../Icon';
import styles from './index.module.less';

// type Iprops = {
//     color: string;
// };
export function ColorButton(props: BaseColorButtonProps) {
    const { color } = props;
    return (
        <div className={styles.colorButton}>
            <ColorPicker color={color} onClick={(color) => {}} onCancel={() => {}} />
            <Icon.Format.NextIcon />
        </div>
    );
}

export class UniverColorButton implements ColorButtonComponent {
    render(): JSXComponent<BaseColorButtonProps> {
        return ColorButton;
    }
}
