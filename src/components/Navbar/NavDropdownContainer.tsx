import React, {Suspense} from 'react';
import {NavDropdown as ND} from 'react-bootstrap';

import * as T from '../commonTypes';

const NavDropdown = React.lazy(() => import('react-bootstrap/NavDropdown'));

interface propsT{
    links: T.singleLinkT[], title: string,
}
export class NavDropdownContainer extends React.Component<propsT>{
    private makeScroller = (ref : T.chartRefT | T.parameterRefT) => {
        const scrollToRef = (ref : T.chartRefT | T.parameterRefT) => {
            window.scrollTo(0, ref.current!.scrollRef.current!.offsetTop);
        }
        return _ => scrollToRef(ref);
    }
    private makeDropdowns = () => {
        return this.props.links.map((link, i) => {
            return (
            <ND.Item eventKey={String(i)} onSelect={this.makeScroller(link[T.singleLinkIndex.ref])} key={i}>
                {link[T.singleLinkIndex.name]}
            </ND.Item>
            );
        })
    }
    render(){
        const title = this.props.title;
        return(
            <Suspense fallback={<div>Loading...</div>}>
                <NavDropdown title={title} id={title}>
                    {this.makeDropdowns()}
                </NavDropdown>
            </Suspense>
        );
    }
}
export default NavDropdownContainer;