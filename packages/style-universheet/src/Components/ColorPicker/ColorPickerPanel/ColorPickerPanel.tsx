import { Component, debounce } from '@univer/base-component';
import { HexColorInput, RgbaStringColorPicker } from 'react-colorful';

import { RgbaColorInput } from '../RgbaColorInput';
import styles from './index.module.less';

interface IProps {
    color: string;
    rgb?: boolean;
    onChange: (color: string) => void;
}

interface IState {
    color: string;
}

class ColorPickerPanel extends Component<IProps, IState> {
    initialize(props: IProps) {
        this.state = {
            color: props.color || '#000',
        };
    }

    setColor(color: string) {
        this.setState({ color });
        this.props.onChange(color);
    }

    render() {
        return (
            <div className={styles.colorPickerPanel} onClick={(e) => e.stopPropagation()}>
                <RgbaStringColorPicker className={styles.colorPicker} color={this.state.color} onChange={debounce(this.setColor.bind(this), 500)} />
                <div className={styles.colorPickerPanelSetting}>
                    <div className={styles.panelInput}>
                        {this.props.rgb ? (
                            <RgbaColorInput color={this.state.color} onChange={debounce(this.setColor.bind(this), 500)} />
                        ) : (
                            <HexColorInput color={this.state.color} onChange={debounce(this.setColor.bind(this), 500)} />
                        )}
                    </div>

                    <div className={styles.panelColor}>
                        <div style={{ background: this.state.color }}></div>
                        <div style={{ background: this.props.color }}></div>
                    </div>
                </div>
            </div>
        );
    }
}

export { ColorPickerPanel };
