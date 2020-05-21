import React from 'react';
import Form from 'react-bootstrap/Form';

import * as T from 'commonTypes';
interface parameterFormState {
    value: string, invalid: boolean
}
interface parameterFormProps {
	newValue: string, controlId: string, handleValueChange: T.handleValueChangeT,
	type: string, label: string, style: Record<string, any>
	labelWidth: number, placeholder: string, //counter?: number[]
}
export class ParameterForm extends React.Component<parameterFormProps, parameterFormState>{
	public static defaultProps = {
		labelWidth: 5, placeholder: "", style : {}
	}
	constructor(props){
        super(props);
		this.state = {value: this.props.newValue || '', invalid: false};
	}
	handleChange = (event) => {
        const errorCode = this.props.handleValueChange(event.target.value, this.props.controlId);
        if(errorCode === undefined){this.updateValue(event.target.value);} //Input is fine - update
        else{this.setState((current) => {return {...current, invalid: true};});}
    }
	updateValue = (newValue) => {
		this.setState((state) => {return {value: newValue, invalid: false};});
    }
	render(){
		return (
<Form.Group className="form-inline" style={{marginBottom: "0.5rem"}}>
	<Form.Label column sm={this.props.labelWidth}>{this.props.label}</Form.Label>
	<Form.Control type={this.props.type} value={this.state.value} 
	style={this.props.style} isInvalid={this.state.invalid}
	placeholder={this.props.placeholder} onChange={this.handleChange}/>
</Form.Group>
		);
	}
}