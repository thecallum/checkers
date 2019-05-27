const hasFont = require('has-font')

// apply font to ctx when loaded
const loadFont = (ctx, font, fontSize) => {
    const int = setInterval(() => {

        if (hasFont('Special Elite')) {
            clearInterval(int);
            console.log('FONT LOADED')

            // initialise font
            ctx.font = `${fontSize}px ${font}`;
        }
    }, 200);
}

module.exports = loadFont;