import React from 'react';
import {InputGroup, Form} from 'react-bootstrap';

import * as T from './commonTypes';

interface parameterFormState {value: string, invalid: boolean}
interface parameterFormProps {
	newValue: string, controlId: string | number, handleValueChange: T.handleValueChangeT,
	type: string, label: string, style: T.styleT
	labelWidth: number, placeholder: string, append: string//counter?: number[]
}
export class ParameterForm extends React.Component<parameterFormProps, parameterFormState>{
	public static defaultProps = {
		labelWidth: 5, placeholder: "", append: "",
		style : {formGroup: {marginBottom: "0.5rem"}, label: {}, inputGroup: {}, 
			formControl: {}, inputGroupAppend: {}}
	}
	appendText: JSX.Element = <></>;
	constructor(props){
        super(props);
		this.state = {value: this.props.newValue || '', invalid: false};
		const makeAppend = () => {
			if(this.props.append !== ""){
				return (<InputGroup.Text id="addon">{this.props.append}</InputGroup.Text>);
			}else{return (<></>);}
		};
		this.appendText = makeAppend();
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
	<Form.Group className="form-inline" style={this.props.style.formGroup}>
		<Form.Label column sm={this.props.labelWidth} style={this.props.style.formLabel}>{this.props.label}</Form.Label>
		<InputGroup style={this.props.style.inputGroup}>
			<Form.Control type={this.props.type} value={this.state.value} 
			style={this.props.style.formControl} isInvalid={this.state.invalid}
			placeholder={this.props.placeholder} onChange={this.handleChange}
			aria-describedby="addon"/>
			<InputGroup.Append style={this.props.style.inputGroupAppend}>
				{this.appendText}
			</InputGroup.Append>
		</InputGroup>
	</Form.Group>
		);
	}
}