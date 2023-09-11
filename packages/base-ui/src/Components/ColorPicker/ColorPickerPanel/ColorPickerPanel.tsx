import React, { useEffect, useState } from 'react';
import { HexColorInput, RgbaStringColorPicker } from 'react-colorful';

import { debounce } from '../../../Utils';
import { RgbaColorInput } from '../RgbaColorInput';
import styles from './index.module.less';

interface IProps {
    color: string;
    rgb?: boolean;
    onChange: (color: string) => void;
}

// interface IState {
//     color: string;
// }

// class ColorPickerPanel extends Component<IProps, IState> {
//     constructor(props: IProps) {
//         super();
//         this.initialize(props);
//     }

//     initialize(props: IProps) {
//         this.state = {
//             color: props.color || '#000',
//         };
//     }

//     setColor(color: string) {
//         this.setState({ color });
//         this.props.onChange(color);
//     }

//     render() {
//         return (
//             <div className={styles.colorPickerPanel} onClick={(e) => e.stopPropagation()}>
//                 <RgbaStringColorPicker className={styles.colorPicker} color={this.state.color} onChange={debounce(this.setColor.bind(this), 500)} />
//                 <div className={styles.colorPickerPanelSetting}>
//                     <div className={styles.panelInput}>
//                         {this.props.rgb ? (
//                             <RgbaColorInput color={this.state.color} onChange={debounce(this.setColor.bind(this), 500)} />
//                         ) : (
//                             <HexColorInput color={this.state.color} onChange={debounce(this.setColor.bind(this), 500)} />
//                         )}
//                     </div>

//                     <div className={styles.panelColor}>
//                         <div style={{ background: this.state.color }}></div>
//                         <div style={{ background: this.props.color }}></div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

// export { ColorPickerPanel };

export function ColorPickerPanel(props: IProps) {
    const { color, rgb, onChange } = props;
    const [currentColor, setCurrentColor] = useState(color || '#000');

    const setColor = (newColor: string) => {
        setCurrentColor(newColor);
        onChange(newColor);
    };

    useEffect(() => {
        setCurrentColor(color || '#000');
    }, [color]);

    return (
        <div className={styles.colorPickerPanel} onClick={(e) => e.stopPropagation()}>
            <RgbaStringColorPicker className={styles.colorPicker} color={currentColor} onChange={debounce(setColor, 500)} />
            <div className={styles.colorPickerPanelSetting}>
                <div className={styles.panelInput}>
                    {rgb ? <RgbaColorInput color={currentColor} onChange={debounce(setColor, 500)} /> : <HexColorInput color={currentColor} onChange={debounce(setColor, 500)} />}
                </div>

                <div className={styles.panelColor}>
                    <div style={{ background: currentColor }}></div>
                    <div style={{ background: color }}></div>
                </div>
            </div>
        </div>
    );
}
