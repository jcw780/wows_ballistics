import React from 'react';
import {OverlayTrigger, Popover} from 'react-bootstrap';

type placementT = 'auto-start' | 'auto' | 'auto-end' | 
                'top-start' | 'top' | 'top-end' |
                'right-start' | 'right' | 'right-end' | 
                'bottom-end' | 'bottom' | 'bottom-start' |
                'left-end' | 'left' | 'left-start';
interface generalTooltipProps {
    title: JSX.Element | string, content: JSX.Element | string, children: JSX.Element | string, placement?: placementT,
}
export const GeneralTooltip : React.SFC<generalTooltipProps> = ({title, content, children, placement='auto'} : generalTooltipProps) => {
    return (
<OverlayTrigger 
    trigger={['hover', 'focus', 'click']} 
    placement={placement}
    overlay={
    <Popover id="popover-basic">
        <Popover.Title as="h3" style={{textAlign: "center"}}>{title}</Popover.Title>
        <Popover.Content>{content}</Popover.Content>
    </Popover>
}>{children}</OverlayTrigger>
    );
}

export type GeneralTooltipT = typeof GeneralTooltip;
export default GeneralTooltip;