import React from 'react';
import {ToggleButtonGroup, ToggleButton, Container, Col, Row} from 'react-bootstrap';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';

import * as T from '../commonTypes';
import {ParameterForm} from '../UtilityComponents/ParameterForm';

class CalculationRadio extends React.PureComponent<{settings: T.settingsT}, {value: number}>{
    constructor(props){
        super(props);
        this.state = {value: this.props.settings.calculationSettings.calculationMethod};
    }
    private setCalcMethod = (event) => {
        const value = parseInt(event.target.value);
        this.props.settings.calculationSettings.calculationMethod = value;
        this.setState({value: parseInt(event.target.value)});
    }
    render(){
        const setCalcMethod = this.setCalcMethod;
        return(
            <Row style={{paddingLeft: '1rem', paddingRight: '1rem', paddingBottom: '.5rem'}}>
                <Col sm="1"/>
                <Col>
            <ToggleButtonGroup toggle vertical type="radio" name="radio" value={this.state.value}>
                <ToggleButton onChange={setCalcMethod} type="radio" value={0} variant="secondary">
                Adams-Bashforth 5
                </ToggleButton>
                <ToggleButton onChange={setCalcMethod} type="radio" value={1} variant="secondary">
                Forward Euler
                </ToggleButton>
                <ToggleButton onChange={setCalcMethod} type="radio" value={2} variant="secondary">
                Runge-Kutta 2
                </ToggleButton>
                <ToggleButton onChange={setCalcMethod} type="radio" value={3} variant="secondary">
                Runge-Kutta 4
                </ToggleButton>
            </ToggleButtonGroup>
            </Col>
            <Col sm="1"/>
            </Row>
        );
    }
}

interface settingsBarProps{
    settings: T.settingsT, updateColors: Function
}
export class SettingsBarInternal extends React.PureComponent<settingsBarProps>{
    titles : T.collapseTitlesT = ["Hide: ", "Show: "]; // 0: Hide 1: Show
    private forms = {
        graphs : {
            distance : [
                ['min', 'Minimum', 'm'], 
                ['max', 'Maximum', 'm'], 
                ['stepSize', 'Step Size', 'm']
            ]
        },
        calculations : {
            launchAngle : [
                ['min', 'Minimum', '°'], 
                ['max', 'Maximum', '°'], 
                ['precision', 'Increment', '°']
            ],
            numericalMethod : [['timeStep', 'Time Step', 's']]
        },
        colors : [
            ['Hue', [['hueMin', 'Min'], ['hueMax', 'Max']]],
			['Chroma', [['chromaMin', 'Min'], ['chromaMax', 'Max']]],
			['Light', [['lightMin', 'Min'], ['lightMax', 'Max']]],
        ],
        line : [
            ['pointRadius', 'Draw Radius', 'px'], 
            ['pointHitRadius', 'Hover Radius', 'px']
        ],
        format : [
            ['rounding', 'Tooltip Rounding', 'dp']
        ]
    }
    private defaultFormStyle = {
        formLabel: {display: "block ruby", padding: 0},
        formControl: {minWidth: '50%', maxWidth: '5.5rem', display: "inline-flex"},
        inputGroup: {display: "inline-flex"},
        inputGroupAppend: {display: "inline-block"},
        formGroup: {display: "block ruby", marginBottom: ".5rem" },
    }
    private generateForms = (forms, target, onChange, sm=4) => {
        return forms.map((value, i) => {
            return(
                <Row key={i}>
                    <Col className="no-lr-padding" sm={sm}>{value[1]}</Col>
                    <Col className="no-lr-padding">
                        <ParameterForm 
                        controlId={value[0]} type="number" 
                        handleValueChange={onChange} 
                        newValue={String(target[value[0]])} 
                        append={value[2]} 
                        labelWidth={3} ariaLabel={value[1]}
                        style={this.defaultFormStyle}>
                            <></>
                        </ParameterForm>
                    </Col>
                </Row>
            );
        });
    }
    //Line
    private onlineChange = (value: string, id: string) => {
        this.props.settings.line[id] = parseFloat(value);
    }
    private generateLineForms = () => {
        return this.generateForms(
            this.forms.line,
            this.props.settings.line,
            this.onlineChange, 
        );
    }
    //Distance Axis
    private handleGraphChange = (value: string, id: string) => {
        var numValue : number | undefined;
        if(value === ''){numValue = undefined;} 
        else{numValue = parseFloat(value);}
        this.props.settings.distance[id] = numValue; 
    }
    private generateGraphForm = () => {
        return this.generateForms(
            this.forms.graphs.distance, 
            this.props.settings.distance, 
            this.handleGraphChange
        );
    }
    //Calculations
    private handleCalculationChange = (value: string, id: string) : void | string => {
        const calculationSettings = this.props.settings.calculationSettings;
        if(value === ''){return 'error';}
        const numValue = parseFloat(value);
        calculationSettings.launchAngle[id] = numValue;
    }
    private generateLaunchAngleForm = () => {
        return this.generateForms(
            this.forms.calculations.launchAngle, 
            this.props.settings.calculationSettings.launchAngle, 
            this.handleCalculationChange
        );
    }
    private handleNumericalMethodChange = (value: string, id: string) : void | string => {
        const calculationSettings = this.props.settings.calculationSettings;
        if(value === ''){return 'error';}
        const numValue = parseFloat(value);
        if(id === 'timeStep'){
            if(numValue <= 0){return 'error';}
            calculationSettings.timeStep = numValue;
        }
    }
    private generateNumericalMethodForm = () => {
        return this.generateForms(
            this.forms.calculations.numericalMethod, 
            this.props.settings.calculationSettings, 
            this.handleNumericalMethodChange
        );
    }

    //Format
    private handleRoundingChange = (value: string, id: string) : void | string => {
        let numValue : number | null = parseInt(value);
        if(numValue < 0){return 'error';} if(value === ''){numValue = null;}
        this.props.settings.format.rounding = numValue; 
    } 
    private generateFormatForms = () => {
        return this.generateForms(
            this.forms.format, 
            this.props.settings.format, 
            this.handleRoundingChange
        );
    }

    private onShortNameChange = (checked) => {this.props.settings.format.shortNames = checked;}
    private onShowLineChange = (checked) => {
        //this.props.settings.format.showLine = event.target.checked;
        this.props.settings.line.showLine = checked;
        //console.log(event);
    }
    //----Color
    private handleColorChange = (value: string, id: string) : void | string => {
        if(value === ''){return 'error';}
        const numValues = parseFloat(value);
        //if(numValues > 1 || numValues < 0){return 'error';}
        this.props.settings.format.colors[id] = numValues;
        this.props.updateColors();
    }
    private generateColorFormsInternal = () => {
        const typeWidth = 3, rowHeight = '3rem'; let counter = 0;
        const addForm = () => {
            const singleRow = (rowGroup : any) => {
                const rowLabel = rowGroup[0], row = rowGroup[1];
                const singleForm = (form) => {
                    const id = form[0], label = form[1];
                    return(
                        <Col className="no-lr-padding" style={{maxHeight: rowHeight}} key={counter++}>
                        <ParameterForm
                            controlId={id} ariaLabel={`${label} ${rowLabel}`} type="number" 
                            newValue={String(this.props.settings.format.colors[id])} 
                            handleValueChange={this.handleColorChange} 
                            labelWidth={0}
                            //style={{
                            //    formLabel: {display: "inline-block"},
                            //    formControl: {maxWidth: '6rem', display: "inline-block"},
                            //    inputGroup: {display: "inline-block"},
                            //    formGroup: {display: "inline-block", },
                            //}}
                            style={this.defaultFormStyle}
                            ></ParameterForm></Col>
                    );
                }
                return (
                    <Row style={{maxHeight: rowHeight}} key={counter++}>
                        <Col sm={typeWidth} className="no-lr-padding" style={{maxHeight: rowHeight}}>
                            {rowLabel}
                        </Col>
                        {row.map(singleForm)}
                    </Row>
                );
            }
            return this.forms.colors.map(singleRow);
        }
        const run = () => {
            return (<>
                <Row style={{maxHeight: rowHeight}}>
                    <Col sm={typeWidth} className="no-lr-padding" style={{maxHeight: rowHeight}}/>
                    <Col className="no-lr-padding" style={{maxHeight: rowHeight}}>Minimum</Col>
                    <Col className="no-lr-padding" style={{maxHeight: rowHeight}}>Maximum</Col>
                </Row>
                {addForm()}
            </>)
        }
        return run;
    }
    private generateColorForms = this.generateColorFormsInternal();
    render(){
        const settings = this.props.settings, format = settings.format;
        return(
    <Container style={{maxWidth: '100%'}}>
        <Row>
            <Col style={{padding: 0}}><h3>Graphs</h3></Col>
            <Col style={{padding: 0}}><h3>Calculations</h3></Col>
        </Row>
        <Row>
            <Col sm="6" style={{padding: 0}}>
                <Row>
                    <Col style={{paddingRight: 0}}>
                        <h4>Line</h4>
                        <Row>
                            <Col className="no-lr-padding">
                                <BootstrapSwitchButton style='switch-toggle'
                                    onlabel='Show Line' offlabel='Show Point' onstyle='success' offstyle='danger'
                                    onChange={this.onShowLineChange} checked={settings.line.showLine}
                                />
                                <h5>Point</h5>
                                {this.generateLineForms()}
                            </Col>
                        </Row>
                    </Col>
                    <Col style={{padding: 0}}>
                        <h4>Labeling</h4>
                        <Row>
                        <Col sm="1"/>
                            <Col className="no-lr-padding">
                                <BootstrapSwitchButton style='switch-toggle'
                                    onlabel='Short Names' offlabel='Long Names' onstyle='success' offstyle='danger'
                                    onChange={this.onShortNameChange} checked={format.shortNames}
                                />
                            </Col>
                        <Col sm="1"/>
                        </Row>
                        {this.generateFormatForms()}
                    </Col>
                </Row>
            </Col>
            <Col style={{padding: 0}}>
                <Row>
                    <Col style={{padding: 0}}>
                        <h4>Launch Angle</h4>
                        {this.generateLaunchAngleForm()}
                    </Col>
                    <Col sm="6" style={{paddingRight: 0, paddingLeft: 0}}>
                        <h4>Numerical Analysis</h4>
                        <CalculationRadio settings={settings}/>
                        {this.generateNumericalMethodForm()}
                    </Col>
                </Row>
            </Col>
        </Row>
        <hr/>
        <Row>
            <Col sm="6" style={{padding: 0}}>
                <Row>
                    <Col className="no-lr-padding">
                        <h4>Range Axis</h4>
                        {this.generateGraphForm()}
                    </Col>
                    <Col style={{paddingLeft: 0, paddingRight: '15px'}}>
                        <h4>Color Generation</h4>
                        {this.generateColorForms()}
                    </Col>
                </Row>
            </Col>
            <Col sm="6" style={{padding: 0}}></Col>
        </Row>
    </Container>
        );
    }
}

export default SettingsBarInternal;