import React from 'react';
import {Row, Col, Button, Modal, Container} from 'react-bootstrap';

import * as T from 'commonTypes';
import {ParameterForm} from 'ParameterForm';
interface angleFormProps {
    newValue: any, controlId: string, 
    label: string, placeholder: string, keyProp : number, 
    handleValueChange: T.handleValueChangeT, deleteElement : Function,
}
class AngleForm extends React.Component<angleFormProps>{
    public static defaultProps = {
        placeholder : "",
    }
    deleteElement = () => {
        this.props.deleteElement(this.props.keyProp, parseInt(this.props.controlId));
    }
    render(){
        return (
            <Modal.Dialog style={{width: '100%', margin: 0}}>
                <Modal.Header 
                style={{padding: 0, paddingTop: '0.5rem', paddingRight: '0.5rem', paddingLeft: '0.5rem'}}
                closeButton onHide={this.deleteElement}>
            <ParameterForm controlId={this.props.controlId} 
            newValue={this.props.newValue}
            handleValueChange={this.props.handleValueChange} 
            type="number" label={this.props.label}
            labelWidth={4} style={{formControl: {width: '60%'}, formGroup: {flexFlow: 'unset'}}} append="°"/>
                </Modal.Header>
            </Modal.Dialog>
        );
    }
}

class TargetFormsContainer extends React.Component
<{}, {angleKeys: Set<number>}>{
    state = {angleKeys: new Set([0, 1, 2, 3, 4, 5, 6, 7])};
    targetData = {
        armor: 70.,
        inclination: 0.,
        width: 18.,
        angles: Array<number>(8),
    };
    fixedTargetLabels = {
        armor: ['Armor Thickness', 'mm'],
        inclination: ['Armor Inclination', '°'],
        width: ['Target Width', 'm'],
    }
    scrollRef : React.RefObject<HTMLHeadingElement> = React.createRef<HTMLHeadingElement>();
    constructor(props){
        super(props);
        Array.from(this.state.angleKeys).forEach((value, i) => {
            this.targetData.angles[i] = value * 5;
        })
    }

    addAngle = () => {
		let index: number = 0;
		let listed: boolean = true;
		const set = this.state.angleKeys;
		while(listed){
			if(set.has(index)){
				index++;
			}else{
				listed = false;
			}
        }
        this.targetData.angles.push(this.targetData.angles.length * 5);
		this.setState((current) => {
			let set = current['angleKeys'];
			return {angleKeys: set.add(index)};
        });
	}

	deleteAngle = (key : number, index : number) => {
		let set = this.state.angleKeys;
        set.delete(key);
        this.targetData.angles.splice(index, 1);
		this.setState((current) => {
			return {angleKeys: set};
		});
    }
    returnData = () => {return this.targetData;}
    handleChange = (value : string, id : string) => {this.targetData[id] = parseFloat(value);}
    handleAngleChange = (value: string, id : string) : void => {
        this.targetData.angles[parseInt(id)] = parseFloat(value);
    }
    render(){
        let angleElements : Array<Array<JSX.Element>> = [];
        const elementColumn = 1;
        Array.from(this.state.angleKeys).forEach((value, i) => {
            const common = 
                <AngleForm key={value} keyProp={value} controlId={i.toString()} 
                newValue={String(this.targetData.angles[i])} deleteElement={this.deleteAngle}
                handleValueChange={this.handleAngleChange}
                label={`Angle ${i + 1}`}/> //start at 0 for display
            const columnIndex = Math.floor(i / elementColumn);
            if(i % elementColumn === 0){
                angleElements.push([]);
            }
            angleElements[columnIndex].push(common);
        });
        return(
        <>
            <h2 ref={this.scrollRef}>Target Parameters</h2>
            <Row>
                <Col sm={1}/>
            {Object.entries(this.fixedTargetLabels).map((kv, i) => {
                const key = kv[0]; const value = kv[1];
                return (
                    <Col>
                        <ParameterForm controlId={key}
                        newValue={String(this.targetData[key])} 
                        handleValueChange={this.handleChange} type="number"
                        label={value[0]} labelWidth={3} append={value[1]}/>
                    </Col>
                );
            }) }
                <Col sm={1}/>
            </Row>
            <h3>Target Angles</h3>
            <Container style={{marginBottom: "1rem"}}>
                <Row>
            {angleElements.map((values, i) => {
                return (
                    <Col key={"R" + i} sm="3" style={{margin: 0, padding: 0}}>
                        {values.map((value) => {
                            return value;
                        })}
                    </Col>
                );
            })}
                </Row>
            </Container>
            
            <Row style={{marginBottom: "1rem"}}>
                <Col/>
                <Col sm="6"><Button className="form-control" variant="outline-primary" onClick={this.addAngle}>
                    Add Angle</Button></Col>
                <Col/>
            </Row>
        </>
        );
    }

    /*componentDidUpdate(){
        console.log(this.targetData);
    }*/
}

export default TargetFormsContainer;