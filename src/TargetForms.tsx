import React from 'react';
import {ParameterForm} from 'ShellForms';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';

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
            <Modal.Dialog style={{width: '100%'}}>
                <Modal.Header closeButton onClick={this.deleteElement}>
            <ParameterForm controlId={this.props.controlId} 
            newValue={this.props.newValue}
            handleValueChange={this.props.handleValueChange} 
            type="number" label={this.props.label}
            labelWidth={4} formWidth={6}/>
                </Modal.Header>
            </Modal.Dialog>
        );
    }
}

class TargetFormsContainer extends React.Component
<{}, {angleKeys: Set<number>}>{
    state = {angleKeys: new Set([0, 1, 2, 3])};
    targetData = {
        armor: 70.,
        inclination: 0.,
        angles: [0, 5, 10, 15],
    };
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
    handleChange = (value : string, id : string) => {
        this.targetData[id] = parseFloat(value);
    }
    handleAngleChange = (value: string, id : string) => {
        this.targetData.angles[parseInt(id)] = parseFloat(value);
    }
    render(){
        let angleElements : Array<Array<JSX.Element>> = [];
        const elementColumn = 2;
        Array.from(this.state.angleKeys).forEach((value, i) => {
            const common = 
                <AngleForm key={value} keyProp={value} controlId={i.toString()} 
                newValue={this.targetData.angles[i]} deleteElement={this.deleteAngle}
                handleValueChange={this.handleAngleChange}
                label={"Angle " + (i + 1)}/>
            const columnIndex = Math.floor(i / elementColumn);
            if(i % elementColumn === 0){
                angleElements.push([]);
            }
            angleElements[columnIndex].push(common);
        });
        return(
        <>
            <h2>Target Data</h2>
            <div className="row" style={{display: 'flex', justifyContent: 'center'}}>
            <ParameterForm controlId="armor"
            newValue={this.targetData.armor} 
            handleValueChange={this.handleChange} type="number"
            label="Armor Thickness" labelWidth={4} formWidth={8}/>
            <ParameterForm controlId="inclination"
            newValue={this.targetData.inclination} 
            handleValueChange={this.handleChange} type="number"
            label="Armor Inclination" labelWidth={4} formWidth={8}/>
            </div>
            <Container>
                <Row>
            {angleElements.map((values, i) => {
                return (
                    <Col key={"R" + i} sm="3">
                        {values.map((value) => {
                            return value;
                        })}
                    </Col>
                );
            })}
                </Row>
            </Container>
            
            <Row>
                <Col/>
                <Col sm="6"><Button className="form-control" onClick={this.addAngle}>Add Angle</Button></Col>
                <Col/>
            </Row>
        </>
        );
    }

    componentDidUpdate(){
        console.log(this.targetData);
    }
}

export default TargetFormsContainer;