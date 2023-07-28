import { RenderEngine } from '@univerjs/base-render';

export function initRender(renderEngine: RenderEngine) {
    const engine = renderEngine.getEngine();
    let container = document.querySelector('#universheet') as HTMLElement;

    // mount canvas to DOM container
    engine.setContainer(container);

    window.addEventListener('resize', () => {
        engine.resize();
    });

    // should be clear
    setTimeout(() => {
        engine.resize();
    }, 0);
}
