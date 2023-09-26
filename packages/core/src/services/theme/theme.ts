export interface IStyleSheet {
    [key: string]: string;
}

class Theme {
    private styleSheet;

    constructor() {
        if (!this.styleSheet) {
            const $style = document.createElement('style');
            document.head.appendChild($style);

            const index = document.styleSheets.length - 1;
            this.styleSheet = document.styleSheets[index];
        }
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
            Object.keys(theme).map((item) => [
                `--${item.replace(/([A-Z0-9])/g, '-$1').toLowerCase()}`,
                currentSkin[item],
            ])
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
