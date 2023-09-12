import { useRef, useState } from 'react';

import { NextIcon } from '../Icon';
import { ColorPicker } from '../index';
import Styles from './index.module.less';

export interface BaseColorPickerCircleButtonProps {
    /**
     * init color
     */
    color: string;

    /**
     * Listen to the confirm button
     */
    onClick: (color: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    /**
     * cancel select
     */
    onCancel?: () => void;

    /**
     * style
     */
    style?: React.CSSProperties;

    /**
     * color picker style
     */
    colorPickerStyle?: React.CSSProperties;
}



// /**
//  * e2e test,check Components.playwright.test.ts
//  */
// export class ColorPickerCircleButton extends Component<BaseColorPickerCircleButtonProps, IState> {
//     ref = createRef<HTMLDivElement>();

//     colorRef = createRef();

//     /**
//      * handle ColorSelectButton Click,show color picker
//      */
//     handleColorSelectButtonClick = (e: Event) => {
//         e.stopImmediatePropagation();
//         this.colorRef.current.showSelect(this.ref.current);
//     };

//     render() {
//         const { color, onClick, onCancel, style, colorPickerStyle } = this.props;

//         return (
//             <div style={style} className={Styles.colorPickerCircleButton} ref={this.ref} onClick={this.handleColorSelectButtonClick}>
//                 <span className={`${Styles.colorSelectCircle} ${Styles.verticalMiddle}`} style={{ backgroundColor: color }}></span>
//                 <NextIcon className={Styles.verticalMiddle} />
//                 <ColorPicker color={color} onClick={onClick} onCancel={onCancel} style={colorPickerStyle} ref={this.colorRef} />
//             </div>
//         );
//     }
// }

export function ColorPickerCircleButton({ color, onClick, onCancel, style, colorPickerStyle }: BaseColorPickerCircleButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [currentColorPickerStyle, setCurrentColorPickerStyle] = useState(colorPickerStyle);
    /**
     * handle ColorSelectButton Click,show color picker
     */
    const handleColorSelectButtonClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.nativeEvent.stopImmediatePropagation();

        setCurrentColorPickerStyle({ display: 'block' });
    };

    return (
        <div
            style={style}
            className={Styles.colorPickerCircleButton} // Make sure to replace Styles with your actual CSS class or styles
            ref={ref}
            onClick={handleColorSelectButtonClick}
        >
            <span className={`${Styles.colorSelectCircle} ${Styles.verticalMiddle}`} style={{ backgroundColor: color }}></span>
            <NextIcon className={Styles.verticalMiddle} /> {/* Replace with your NextIcon component */}
            {/* Replace ColorPicker with your actual ColorPicker component */}
            <ColorPicker color={color} onClick={onClick} onCancel={onCancel} style={currentColorPickerStyle} />
        </div>
    );
}
