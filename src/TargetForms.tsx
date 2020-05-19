import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';

import {ParameterForm} from './ShellForms';
interface angleFormProps {
    newValue: any, controlId: string, 
    label: string, placeholder: string, keyProp : number, 
    handleValueChange: Function, deleteElement : Function,
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
            labelWidth={4} style={{width: '60%'}}/>
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
    returnData = () => {
        return this.targetData;
    }
    handleChange = (value : string, id : string) => {
        this.targetData[id] = parseFloat(value);
    }
    handleAngleChange = (value: string, id : string) => {
        this.targetData.angles[parseInt(id)] = parseFloat(value);
    }
    render(){
        let angleElements : Array<Array<JSX.Element>> = [];
        const elementColumn = 1;
        Array.from(this.state.angleKeys).forEach((value, i) => {
            const common = 
                <AngleForm key={value} keyProp={value} controlId={i.toString()} 
                newValue={this.targetData.angles[i]} deleteElement={this.deleteAngle}
                handleValueChange={this.handleAngleChange}
                label={"Angle " + (i + 1) + " (°)"}/>
            const columnIndex = Math.floor(i / elementColumn);
            if(i % elementColumn === 0){
                angleElements.push([]);
            }
            angleElements[columnIndex].push(common);
        });
        return(
        <>
            <h2 ref={this.scrollRef}>Target Parameters</h2>
            <div className="row" style={{display: 'flex', justifyContent: 'center'}}>
            <ParameterForm controlId="armor"
            newValue={this.targetData.armor} 
            handleValueChange={this.handleChange} type="number"
            label="Armor Thickness" labelWidth={4} />
            <ParameterForm controlId="inclination"
            newValue={this.targetData.inclination} 
            handleValueChange={this.handleChange} type="number"
            label="Armor Inclination" labelWidth={4} />
            <ParameterForm controlId="width"
            newValue={this.targetData.width} 
            handleValueChange={this.handleChange} type="number"
            label="Target Width" labelWidth={4} />
            </div>
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
                <Col sm="6"><Button className="form-control" onClick={this.addAngle}>Add Angle</Button></Col>
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