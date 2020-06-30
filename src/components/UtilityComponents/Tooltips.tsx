import React from 'react';
import {OverlayTrigger, Popover} from 'react-bootstrap';

interface generalTooltipProps {
    title: JSX.Element | string, content: JSX.Element | string, children: JSX.Element | string
}
export const GeneralTooltip : React.SFC<generalTooltipProps> = ({title, content, children} : generalTooltipProps) => {
    return (
<OverlayTrigger trigger={['hover', 'focus', 'click']} overlay={
    <Popover id="popover-basic">
        <Popover.Title as="h3" style={{textAlign: "center"}}>{title}</Popover.Title>
        <Popover.Content>
            {content}
        </Popover.Content>
    </Popover>
}>{children}</OverlayTrigger>
    );
}

export type GeneralTooltipT = typeof GeneralTooltip;
export default GeneralTooltip;