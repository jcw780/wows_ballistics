import React from 'react';
import {Nav, Navbar, NavDropdown} from 'react-bootstrap';

import * as T from 'commonTypes';

class NavbarCustom extends React.Component<{links: T.linkT}>{
    state = {update: true};
    update = () => {this.setState(this.state);}

    render(){
        //Parameters
        const scrollToRef = (ref : T.chartRefT | T.parameterRefT) => {
            window.scrollTo(0, ref.current!.scrollRef.current!.offsetTop);
        }
        //Charts
        const makeDropdowns = (target : T.linkKeyT) => {
            return this.props.links[target].map((value, i) => {
                return <NavDropdown.Item onSelect={() => {scrollToRef(value[1])}} key={i}>{value[0]}</NavDropdown.Item>
            });
        };

        return(
            <Navbar variant="dark" bg="dark" expand="lg" fixed="top">
                <Navbar.Brand onClick={() => {window.scrollTo(0, 0);}}>World of Warships Ballistics Calculator 2</Navbar.Brand>
                <Nav className="mr-auto">
                    <NavDropdown title="Parameters" id="basic-nav-dropdown">
                        {makeDropdowns('parameters')}
                    </NavDropdown>
                    <NavDropdown title="Impact Charts" id="basic-nav-dropdown">
                        {makeDropdowns('impact')}
                    </NavDropdown>
                    <NavDropdown title="Angle Charts" id="basic-nav-dropdown">
                        {makeDropdowns('angle')}
                    </NavDropdown>
                    <NavDropdown title="Post-Pentration Charts" id="basic-nav-dropdown">
                        {makeDropdowns('post')}
                    </NavDropdown>
                </Nav>
            </Navbar>
        );
    }
}

export default NavbarCustom;