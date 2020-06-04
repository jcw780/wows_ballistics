import React from 'react';
import {Button} from 'react-bootstrap';

export class DownloadButton extends React.Component<{updateData: Function, label: string}>{
    state = {href: '', download: ''} 
    update = (href : string, download : string) : void => {
        this.setState({href: href, download: download});
    }
    private click = () => {this.props.updateData()}
    render(){
        return (
            <a download={this.state.download} href={this.state.href}>
                <Button variant="outline-secondary" onClick={this.click}>
                    {this.props.label}
                </Button>
            </a>
        );
    }
}

export default DownloadButton;