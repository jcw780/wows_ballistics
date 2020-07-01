import React, {Suspense} from 'react';
import {Row, Col, Nav, Navbar, NavDropdown as ND} from 'react-bootstrap';

import * as T from './commonTypes';

const NavDropdown = React.lazy(() => import('react-bootstrap/NavDropdown'));
const fallback = <div>Loading...</div>;
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
            return( 
                <ND.Item eventKey={String(i)} onSelect={this.makeScroller(link[T.singleLinkIndex.ref])} key={i}>
                    {link[T.singleLinkIndex.name]}
                </ND.Item>
            );
        });
    };
    private scrollToTop = _ => window.scrollTo(0, 0);
    render(){
        return(
<Navbar collapseOnSelect variant="dark" bg="dark" expand="lg" fixed="top">
    <Navbar.Brand onClick={this.scrollToTop}>
        <Row>
            <Col className="no-lr-padding" style={{maxWidth: '32px'}}>
                <img height='32' width='32' alt="logo"
                src={process.env.PUBLIC_URL + '/android-chrome-192x192.png'}/>
            </Col>
            <Col style={{paddingLeft: '1rem', paddingRight: 0}}>
                WoWS Ballisitics Calculator
            </Col>
        </Row>
    </Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" label="Toggle Navigation"/>
    <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
            <Suspense fallback={fallback}>
                <NavDropdown title="Parameters" id="parameters">
                    {this.makeDropdowns('parameters')}
                </NavDropdown>
            </Suspense>
            <Suspense fallback={fallback}>
                <NavDropdown title="Impact Charts" id="impact charts">
                    {this.makeDropdowns('impact')}
                </NavDropdown>
            </Suspense>
            <Suspense fallback={fallback}>
                <NavDropdown title="Angle Charts" id="angle charts">
                    {this.makeDropdowns('angle')}
                </NavDropdown>
            </Suspense>
            <Suspense fallback={fallback}>
                <NavDropdown title="Post-Pentration Charts" id="post penetration">
                    {this.makeDropdowns('post')}
                </NavDropdown>
            </Suspense>
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