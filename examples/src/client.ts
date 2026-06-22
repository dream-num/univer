// @ts-nocheck
import ReactDOM from 'react-dom';

export function createRoot(container: HTMLElement) {
    return {
        render: (element: JSX.Element) => {
            ReactDOM.render(element, container);
        },
    };
}
