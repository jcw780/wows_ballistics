import React from 'react';
import {Nav, Navbar, NavDropdown} from 'react-bootstrap';

import * as T from './commonTypes';

class NavbarCustom extends React.Component<{links: T.linkT}>{
    state = {update: true};
    update = () => {this.setState(this.state);}
    private makeScroller = (ref : T.chartRefT | T.parameterRefT) => {
        const scrollToRef = (ref : T.chartRefT | T.parameterRefT) => {
            window.scrollTo(0, ref.current!.scrollRef.current!.offsetTop);
        }
        return _ => scrollToRef(ref);
    }
    private makeDropdowns = (target : T.linkKeyT) => {
        return this.props.links[target].map((link, i) => {
            /*return <NavDropdown.Item onSelect={() => {this.scrollToRef(link[T.singleLinkIndex.ref])}} key={i}>
                {link[T.singleLinkIndex.name]}</NavDropdown.Item>*/
            return <NavDropdown.Item onSelect={this.makeScroller(link[T.singleLinkIndex.ref])} key={i}>
            {link[T.singleLinkIndex.name]}</NavDropdown.Item>
        });
    };
    private scrollToTop = _ => window.scrollTo(0, 0);
    render(){
        return(
<Navbar variant="dark" bg="dark" expand="lg" fixed="top">
    <Navbar.Brand onClick={this.scrollToTop}>World of Warships Ballistics Calculator</Navbar.Brand>
    <Nav className="mr-auto">
        <NavDropdown title="Parameters" id="basic-nav-dropdown">
            {this.makeDropdowns('parameters')}
        </NavDropdown>
        <NavDropdown title="Impact Charts" id="basic-nav-dropdown">
            {this.makeDropdowns('impact')}
        </NavDropdown>
        <NavDropdown title="Angle Charts" id="basic-nav-dropdown">
            {this.makeDropdowns('angle')}
        </NavDropdown>
        <NavDropdown title="Post-Pentration Charts" id="basic-nav-dropdown">
            {this.makeDropdowns('post')}
        </NavDropdown>
    </Nav>
    <Nav className="navbar-right">
        <NavDropdown title="Support" id="basic-nav-dropdown" alignRight>
            <NavDropdown.Item href="https://github.com/jcw780/wows_ballistics">Github</NavDropdown.Item>
            <NavDropdown.Item href="https://github.com/jcw780/wows_ballistics/issues">Issues</NavDropdown.Item>
        </NavDropdown>
    </Nav>
</Navbar>
        );
    }
}

export default NavbarCustom;