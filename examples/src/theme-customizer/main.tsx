import { ConfigProvider, render } from '@univerjs/design';
import enUS from '@univerjs/mockdata/locales/en-US';
import { ThemeCustomizerApp } from './theme-customizer-app';
import '../global.css';

render(
    <ConfigProvider locale={enUS.design} mountContainer={document.body}>
        <ThemeCustomizerApp />
    </ConfigProvider>,
    document.getElementById('app')!
);
