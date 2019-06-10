const setCanvasWidth = function() {
    const maxWidth = this.canvas.maxWidth;
    // 40px for padding
    const width = document.body.clientWidth - 40 > maxWidth ? maxWidth : document.body.clientWidth - 40;
    this.canvas.width = width;
    this.canvas.gridSize = width / 8;
    this.canvas.halfGridSize = width / 16;
};

module.exports = setCanvasWidth;
