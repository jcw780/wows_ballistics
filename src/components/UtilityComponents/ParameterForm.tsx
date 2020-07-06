import React from 'react';
import {InputGroup, Form} from 'react-bootstrap';

import * as T from '../commonTypes';

interface parameterFormState {value: string, invalid: boolean}
interface parameterFormProps {
	newValue: string, controlId: string | number, onChange: T.handleValueChangeT,
	type: string, children?: JSX.Element | string, style: T.styleT, ariaLabel: string,
	labelWidth: number, placeholder: string, append: string//counter?: number[]
}
export class ParameterForm extends React.Component<parameterFormProps, parameterFormState>{
	public static defaultProps = {
		labelWidth: 5, placeholder: "", append: "",
		style : {formGroup: {marginBottom: "0.5rem"}, label: {}, inputGroup: {}, 
			formControl: {}, inputGroupAppend: {}}
	}
	constructor(props){
        super(props);
		this.state = {value: this.props.newValue || '', invalid: false};
	}
	onChange = event => {
		const errorCode = this.props.onChange(event.target.value, this.props.controlId);
        if(errorCode !== 'error') this.updateValue(event.target.value); //Input is fine - update
        else this.setState(current => {return {...current, invalid: true};});
    }
	updateValue = newValue => this.setState(state => {return {value: newValue, invalid: false};});
	private makeAppend = () => {
		if(this.props.append !== ""){
			return (<InputGroup.Text id="addon">{this.props.append}</InputGroup.Text>);
		}else return false;
	};
	private makeInputGroupInternal = () => {
		const props = this.props, state = this.state, style = props.style;
		const appendText = this.makeAppend();
		const formControl = (
			<Form.Control type={props.type} value={state.value} 
			style={style.formControl} isInvalid={state.invalid}
			placeholder={props.placeholder} onChange={this.onChange}
			aria-describedby="addon" aria-label={props.ariaLabel}/>
		);
		return () => {
			if(appendText !== false){
				return(
					<InputGroup style={props.style.inputGroup}>
						{formControl}
						<InputGroup.Append style={style.inputGroupAppend}>
							{appendText}
						</InputGroup.Append>
					</InputGroup>
				);
			}else return formControl;
		}
	}
	private makeInputGroup = () => this.makeInputGroupInternal()();
	private makeLabelGroup = () => {
		const props = this.props, style = props.style;
		if(props.children !== undefined && props.children !== (<></>)){
			return (
				<Form.Label column sm={props.labelWidth} style={style.formLabel}>{props.children}</Form.Label>
			);
		}else{
			return (<></>);
		}
	}
	render(){
		const props = this.props, style = props.style;
		return(
			<Form.Group className="form-inline" style={style.formGroup}>
				{this.makeLabelGroup()}
				{this.makeInputGroup()}
			</Form.Group>
		);	
	}
}

export default ParameterForm;