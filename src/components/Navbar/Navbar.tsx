import React, {Suspense} from 'react';
import {Nav, Navbar, NavDropdown as ND} from 'react-bootstrap';

import * as T from '../commonTypes';
import NavDropdownContainer from './NavDropdownContainer';

//const NavDropdownContainer = React.lazy(() => import('./NavDropdownContainer'));
const NavDropdown = React.lazy(() => import('react-bootstrap/NavDropdown'));
const fallback = <div>Loading...</div>;
class NavbarCustom extends React.Component<{links: T.linkT}>{
    state = {update: true};
    navDropdownContainers : React.RefObject<NavDropdownContainer>[] = [];
    update = () => {
        if(this.navDropdownContainers[3] !== undefined){
            this.navDropdownContainers[3].current!.forceUpdate();
        }
    }
    updateAll = () => {
        this.navDropdownContainers.forEach((container) => {
            if(container !== undefined){
                container.current?.forceUpdate();
            }
        })
    }
    
    private scrollToTop = _ => window.scrollTo(0, 0);
    render(){
        const links = this.props.links;
        return(
<Navbar collapseOnSelect variant="dark" bg="dark" expand="lg" fixed="top">
    <Navbar.Brand onClick={this.scrollToTop}>
        <img height='32' width='32' alt="logo"
        src={process.env.PUBLIC_URL + '/android-chrome-192x192.png'}/>
    </Navbar.Brand>
    <Navbar.Brand onClick={this.scrollToTop}>
        WoWS Ballisitics Calculator
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" label="Toggle Navigation"/>
    <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
            <NavDropdownContainer title="Parameters" links={links['parameters']} shouldUpdate={false}
                ref={this.navDropdownContainers[0]}
            />
            <NavDropdownContainer title="Impact Charts" links={links['impact']} shouldUpdate={false}
                ref={this.navDropdownContainers[1]}
            />
            <NavDropdownContainer title="Angle Charts" links={links['angle']} shouldUpdate={false}
                ref={this.navDropdownContainers[2]}
            />
            <NavDropdownContainer title="Post-Pentration Charts" links={links['post']} shouldUpdate={true}
                ref={this.navDropdownContainers[3]}
            />
        </Nav>
        <Nav>
            <Suspense fallback={<div>Loading...</div>}>
                <NavDropdown title="Support" id="support" alignRight>
                    <ND.Item href="https://github.com/jcw780/wows_ballistics">Github</ND.Item>
                    <ND.Item href="https://github.com/jcw780/wows_ballistics/issues">Issues</ND.Item>
                </NavDropdown>
            </Suspense>
        </Nav>
    </Navbar.Collapse>
</Navbar>
        );
    }
}

export default NavbarCustom;