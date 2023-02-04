import { JSXComponent } from '../../../BaseComponent';
import { BaseIconProps, IconComponent } from '../../../Interfaces';
import { Icon } from '../AddIcon';

const DeleteIcon = (props: BaseIconProps) => (
    <Icon spin={props.spin} rotate={props.rotate} name="logo" style={props.style}>
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1214" width="1em" height="1em">
            <path
                d="M840 288H688v-56c0-40-32-72-72-72h-208C368 160 336 192 336 232V288h-152c-12.8 0-24 11.2-24 24s11.2 24 24 24h656c12.8 0 24-11.2 24-24s-11.2-24-24-24zM384 288v-56c0-12.8 11.2-24 24-24h208c12.8 0 24 11.2 24 24V288H384zM758.4 384c-12.8 0-24 11.2-24 24v363.2c0 24-19.2 44.8-44.8 44.8H332.8c-24 0-44.8-19.2-44.8-44.8V408c0-12.8-11.2-24-24-24s-24 11.2-24 24v363.2c0 51.2 41.6 92.8 92.8 92.8h358.4c51.2 0 92.8-41.6 92.8-92.8V408c-1.6-12.8-12.8-24-25.6-24z"
                p-id="1215"
            ></path>
            <path
                d="M444.8 744v-336c0-12.8-11.2-24-24-24s-24 11.2-24 24v336c0 12.8 11.2 24 24 24s24-11.2 24-24zM627.2 744v-336c0-12.8-11.2-24-24-24s-24 11.2-24 24v336c0 12.8 11.2 24 24 24s24-11.2 24-24z"
                p-id="1216"
            ></path>
        </svg>
    </Icon>
);

export default DeleteIcon;

export class UniverDeleteIcon implements IconComponent {
    render(): JSXComponent<BaseIconProps> {
        return DeleteIcon;
    }
}
