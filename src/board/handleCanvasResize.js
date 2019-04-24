const handleCanvasResize = function() {
    const width = window.innerWidth < 620 ? window.innerWidth -20 : 600;

    this.setState({
        width,
        height: width,
        gridSize: width /8,
        halfGridSize: width/16,
    }, this.state.gameStarted ? this.updateCanvas : this.preUpdateCanvas);
}

export default handleCanvasResize;