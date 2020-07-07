import React from 'react';
import {Button} from 'react-bootstrap';

export class DownloadButton extends React.Component<{updateData: Function, label: string, style: Record<string, any>}>{
    public static defaultProps = {
        style: {}
    }
    state = {href: '', download: ''} 
    update = (href : string, download : string) : void => {
        this.setState({href: href, download: download});
    }
    private click = () => {this.props.updateData()}
    render(){
        const {state, props} = this;
        return (
<a download={state.download} href={state.href}>
    <Button variant="outline-secondary" onClick={this.click} style={props.style}>{props.label}</Button>
</a>
        );
    }
}

export default DownloadButton;