const checkOptionsClicked = (options, gridSize) => {
    if (options.length === 0) return null;

    let selectedOption = null;

    for (let option of options) {
        if (
            offsetX > (option.end.x * gridSize) && 
            offsetX < (option.end.x * gridSize) + gridSize &&
            offsetY > (option.end.y * gridSize) && 
            offsetY < (option.end.y * gridSize) + gridSize 
        ) {
            selectedOption = option;
            break;
        }
    }

    return selectedOption;
}

module.exports = checkOptionsClicked;