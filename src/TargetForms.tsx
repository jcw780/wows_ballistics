import React from 'react';
import {ParameterForm} from 'ShellForms';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

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

	deleteAngle = (key, index) => {
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
        const elementColumn = 4;
        Array.from(this.state.angleKeys).forEach((value, i) => {
            const common = 
                <ParameterForm key={value} controlId={i.toString()} 
                    newValue={this.targetData.angles[i]}
                    handleValueChange={this.handleAngleChange} 
                    type="number" label={"Angle " + (i + 1)}
                    labelWidth={3} formWidth={4}/>
            const columnIndex = Math.floor(i / elementColumn);
            if(i % elementColumn == 0){
                angleElements.push([]);
            }
            angleElements[columnIndex].push(common);
        });
        return(
        <>
            <h2>Target Data</h2>
            <ParameterForm controlId="armor"
            newValue={this.targetData.armor} 
            handleValueChange={this.handleChange} type="number"
            label="Armor Thickness"/>
            <ParameterForm controlId="inclination"
            newValue={this.targetData.inclination} 
            handleValueChange={this.handleChange} type="number"
            label="Armor Inclination"/>
            <div className="rows">
            {angleElements.map((values, i) => {
                return (
                    <div className="row" key={"R" + i}>
                        {values.map((value) => {
                            return value;
                        })}
                    </div>
                );
            })}
            </div>
            <Row>
                <Col/>
                <Col sm="6"><Button className="form-control" onClick={this.addAngle}>Add Angle</Button></Col>
                <Col/>
            </Row>
        </>
        );
    }
}

export default TargetFormsContainer;