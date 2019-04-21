const canvasReady = function({ canvas, draw, preDraw }) {
    this.canvasElement = canvas;
    this.canvasElement.addEventListener('click', this.clickHandler);
    this.updateCanvas = draw;
    this.preUpdateCanvas = preDraw;

    preDraw();
}

export default canvasReady;