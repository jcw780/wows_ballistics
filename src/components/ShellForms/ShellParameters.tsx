import React, {Suspense} from 'react';
import {Form, Col, Row} from 'react-bootstrap';
import {Icon} from 'semantic-ui-react';
import clonedeep from 'lodash.clonedeep';

import * as S from './Types';
import {ParameterForm, DownloadButton} from '../UtilityComponents';

const GeneralTooltip = React.lazy(() => import('../UtilityComponents/Tooltips'));

interface shellParametersProps {handleValueChange: any, formLabels : S.formLabelsT, formData: S.formDataT}
export class ShellParameters extends React.PureComponent<shellParametersProps>{
	nameForm = React.createRef<ParameterForm>();
	downloadRef = React.createRef<DownloadButton>();
	onChange = (value, k) => {this.props.handleValueChange(value, k);}
	private updateShellsI = () => {
		const props = this.props;
		const updateItem = ([key, value] : [S.formsT, S.labelT]): void => {
			value[S.labelI.ref].current!.updateValue(props.formData[key]);
		}
		const run = () => Object.entries(props.formLabels).forEach(updateItem);
		return run;
	}
	updateShells = () => {this.updateShellsI()();}
	updateDownloadJSON = () => {
		const formData = this.props.formData, selectedData = clonedeep(FormData); delete selectedData.colors;
        const url = URL.createObjectURL(new Blob([JSON.stringify(selectedData)], {type: 'text/json;charset=utf-8'}));
        this.downloadRef.current!.update(url, formData.name + '.json');
	}
	addForms = () => {
		const props = this.props;
		const commonStyle = {
			inputGroup:{width: "50%"},
			formLabel:{padding: 0}
		}
		const singleForm = ([key, value] : [S.formsT, S.labelT], i) => {
			const name = value[S.labelI.name];
			return (
			<ParameterForm ref={value[S.labelI.ref]}
				key={i} 
				controlId={key}
				newValue={String(props.formData[key])}
				onChange={this.onChange} 
				type="number" 
				append={value[S.labelI.unit]}
				style={commonStyle} 
				ariaLabel={name}>
                    <Suspense fallback={<div>Loading...</div>}>
                        <GeneralTooltip title={name} content={value[S.labelI.description]}>
							<div>
								{name}
								<Icon name='question circle outline' color='grey'/>
							</div>
                        </GeneralTooltip>
                    </Suspense>
			</ParameterForm>);
		}
		const run = () => Object.entries(props.formLabels).map(singleForm); return run;
	}
	render() {
		return(
<>
	<Form>
		{this.addForms()()}	
	</Form>
	<Row className="justify-content-sm-center">
		<Col sm="6">
			<DownloadButton ref={this.downloadRef}
				label="Download Raw" 
				updateData={this.updateDownloadJSON}
				style={{width: "100%"}}
			/>
		</Col>
	</Row>
</>
		);
	}
}

export type ShellParametersT = ShellParameters;

export default ShellParameters;