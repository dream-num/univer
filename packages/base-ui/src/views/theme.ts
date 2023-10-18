import { IStyleSheet } from '@univerjs/core';

function convertToDashCase(input: string): string {
    const dashCase = input.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/(\d+)/g, '-$1');

    return `--${dashCase}`;
}

class Theme {
    private styleSheet;

    constructor() {
        const $style = document.createElement('style');
        document.head.appendChild($style);

        const index = document.styleSheets.length - 1;
        this.styleSheet = document.styleSheets[index];
    }

    setTheme(theme: IStyleSheet) {
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

        let currentSkin = theme;
        currentSkin = Object.fromEntries(
            Object.keys(theme).map((item) => [convertToDashCase(item), currentSkin[item]])
        );

        // 3. insert new theme
        // TODO: CSS selector should be configurable
        this.styleSheet.insertRule(
            `:root ${JSON.stringify(currentSkin)
                .replace(/"/g, '')
                .replace(/,(?=--)/g, ';')}`
        );
    }
}

export const themeInstance = new Theme();
