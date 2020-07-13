import React from 'react';
import './CloseButton.css';

interface props{
    onClick: (event: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void
}
export const CloseButton : React.FunctionComponent<props> = ({onClick}) => {
    return(
        <button className="close-custom" onClick={onClick} type="button">
            <span aria-hidden="true">×</span>
        </button>
    );
}