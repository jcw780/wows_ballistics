import React, {Suspense} from 'react';
import {Button, Collapse} from 'react-bootstrap';

import * as T from '../commonTypes';
const SettingsBarInternal = React.lazy(() => import('./SettingsBarInternal'));

interface settingsBarState{open: boolean}
interface settingsBarProps{
    settings: T.settingsT, updateColors: Function
}
export class SettingsBar extends React.Component<settingsBarProps, settingsBarState>{
    state = {open : false}; scrollRef = React.createRef<Button & HTMLButtonElement>();
    titles : T.collapseTitlesT = ["Hide: ", "Show: "]; // 0: Hide 1: Show
    private toggleCollapse = () => this.setState((current) => {return {open: !current.open}});
    render(){
        const settings = this.props.settings, open = this.state.open;
        return(
        <>
            <Button style={{width: "100%", paddingTop: "0.6rem", paddingBottom: "0.6rem", height: "3rem"}}
                onClick={this.toggleCollapse} ref={this.scrollRef}
                aria-controls="collapseSettings"
                aria-expanded={open} variant="dark"
                className={open === true ? 'active' : ''}>
                {this.titles[Number(!open)] + 'Settings'}
            </Button>
            <Collapse in={open}>
                <div id="collapseSettings">
                    <Suspense fallback={<div>Loading...</div>}>
                        <SettingsBarInternal settings={settings} updateColors={this.props.updateColors}/>
                    </Suspense>
                </div>
            </Collapse> 
        </>);
    }
}

export default SettingsBar;