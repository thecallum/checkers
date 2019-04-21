import React from 'react';

const Modal = props => (
    <div className={`modal ${props.show ? 'modal__show' : ''}`}>
        <div className="modal__background"/>
        <div className="modal__body">{ !!props.children && props.children }</div>
    </div>
);

export default Modal;