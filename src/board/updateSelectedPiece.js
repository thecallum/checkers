const updateSelectedPiece = function(found) {
    return new Promise(resolve => {
        if (!!found) {    
            // if selected piece === previously selected piece, deselect it    
            if (!!this.state.selectedPiece && found.id === this.state.selectedPiece.id) {
                found.toggleActive(false);
                this.setState({ 
                    selectedPiece: null, 
                    options: [] 
                }, resolve);
            } else {
                // otherwise, deactivate old piece, and activate new piece
                if (this.state.selectedPiece !== null) {
                    this.state.selectedPiece.toggleActive(false)
                }
            
                found.toggleActive(true);
                this.setState({ 
                    selectedPiece: found, 
                    options: this.generateOptions(found, this.state.activePlayer) 
                }, resolve);
            }
        } else {
            // nothing clicked, remove any selected pieces
            if (this.state.selectedPiece !== null) {
                this.state.selectedPiece.toggleActive(false)
                this.setState({ 
                    selectedPiece: null, 
                    options: [] 
                }, resolve);
            } else {
                resolve()
            }
        }
    });
}

export default updateSelectedPiece;