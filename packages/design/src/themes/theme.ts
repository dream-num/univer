function convertToDashCase(input: string): string {
    const dashCase = input.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/(\d+)/g, '-$1');

    return `--${dashCase}`;
}

function convertHexToRgb(input: string): string {
    if (input.startsWith('#')) {
        const hex = input.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `${r}, ${g}, ${b}`;
    }

    return input;
}

class Theme {
    private styleSheet;

    constructor() {
        const $style = document.createElement('style');
        document.head.appendChild($style);

        const index = document.styleSheets.length - 1;
        this.styleSheet = document.styleSheets[index];
    }

    setTheme(root: HTMLElement, theme: Record<string, string>) {
        // 1. remove old theme
        if (this.styleSheet) {
            let index = 0;
            for (let i = 0; i < this.styleSheet.cssRules.length; i++) {
                const rule = this.styleSheet.cssRules[i];

                if (rule instanceof CSSStyleRule) {
                    index = i;
                    this.styleSheet.deleteRule(index);
                    break;
                }
            }
        }

        // 2. convert new theme to css style
        /**
         *  covert object to style, remove " and replace , to ;
         *  Example:
         *  before: {--primary-color:"#0188fb",--primary-color-hover:"#5391ff"}
         *  after:  {--primary-color:#0188fb;--primary-color-hover:#5391ff;}
         */
        Object.keys(theme).forEach((key) => {
            const property = convertToDashCase(key);
            const value = convertHexToRgb(theme[key]);
            root.style.setProperty(property, value);
        });
    }
}

export const themeInstance = new Theme();
