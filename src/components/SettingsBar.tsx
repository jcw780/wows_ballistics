import React from 'react';
import {Button, ToggleButtonGroup, ToggleButton, Collapse, Container, Col, Row} from 'react-bootstrap';

import * as T from './commonTypes';
import {ParameterForm} from './ParameterForm';

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

interface settingsBarState{open: boolean}
interface settingsBarProps{
    settings: T.settingsT, updateColors: Function
}
export class SettingsBar extends React.PureComponent<settingsBarProps, settingsBarState>{
    state = {open : false}; scrollRef = React.createRef<Button & HTMLButtonElement>();
    titles : T.collapseTitlesT = ["Hide: ", "Show: "]; // 0: Hide 1: Show
    private toggleCollapse = () => {
        this.setState((current) => {return {open: !current.open}});
    }
    private forms = {
        graphs : {
            distance : [['min', 'Minimum'], ['max', 'Maximum'], ['stepSize', 'Step Size']]
        },
        calculations : {
            launchAngle : [['min', 'Minimum', '°'], ['max', 'Maximum', '°'], ['precision', 'Increment', '°']],
            numericalMethod : [['timeStep', 'Time Step', 's']]
        },
        colors : [
            ['Hue', [['hueMin', 'Min'], ['hueMax', 'Max']]],
			['Chroma', [['chromaMin', 'Min'], ['chromaMax', 'Max']]],
			['Light', [['lightMin', 'Min'], ['lightMax', 'Max']]],
        ]
    }
    //Graphs
    private handleGraphChange = (value: string, id: string) => {
        var numValue : number | undefined;
        if(value === ''){numValue = undefined;} 
        else{numValue = parseFloat(value);}
        this.props.settings.distance[id] = numValue; 
    }
    private generateGraphForm = () => {
        const rangeAxisFormStyle = {formLabel: {paddingTop: 0, paddingBottom: 0}, formGroup: {marginBottom: ".5rem"}};
        return this.forms.graphs.distance.map((value, i) => {
            return(
                <ParameterForm 
                controlId={value[0]} key={i} type="number" 
                handleValueChange={this.handleGraphChange} 
                newValue={String(this.props.settings.distance[value[0]])} 
                append="m" 
                labelWidth={3} style={rangeAxisFormStyle} ariaLabel={value[1]}>
                    {value[1]}
                </ParameterForm>
            );
        });
    }
    //Calculations
    private handleCalculationChange = (value: string, id: string) : void | string => {
        const calculationSettings = this.props.settings.calculationSettings;
        if(value === ''){return 'error';}
        const numValue = parseFloat(value);
        calculationSettings.launchAngle[id] = numValue;
    }
    private generateLaunchAngleForm = () => {
        const forms = this.forms, calculationSettings = this.props.settings.calculationSettings;
        return forms.calculations.launchAngle.map((value, i) => {
            const initialValue = calculationSettings.launchAngle[value[0]];
            return(
                <ParameterForm 
                controlId={value[0]} key={i} type="number" 
                newValue={String(initialValue)} 
                handleValueChange={this.handleCalculationChange} 
                labelWidth={3} append={value[2]} ariaLabel={value[1]}>
                    {value[1]}
                </ParameterForm>
            );
        });
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
        const forms = this.forms;
        const calculationSettings = this.props.settings.calculationSettings;
        return forms.calculations.numericalMethod.map((value, i) => {
            const initialValue = calculationSettings[value[0]];
            return(
                <ParameterForm newValue={String(initialValue)} controlId={value[0]} key={i} ariaLabel={value[1]}
                type="number" handleValueChange={this.handleNumericalMethodChange} labelWidth={3} append={value[2]}>
                    {value[1]}
                </ParameterForm>
            );
        });
    }
    //Format
    private handleRoundingChange = (value: string, id: string) : void | string => {
        let numValue : number | null = parseInt(value);
        if(numValue < 0){return 'error';} if(value === ''){numValue = null;}
        this.props.settings.format.rounding = numValue; 
    } 
    private handleShortNameChange = (event) => {this.props.settings.format.shortNames = event.target.checked;}
    private handleShowLineChange = (event) => {this.props.settings.format.showLine = event.target.checked;}
    //----Color
    private handleColorChange = (value: string, id: string) : void | string => {
        if(value === ''){return 'error';}
        const numValues = parseFloat(value);
        //if(numValues > 1 || numValues < 0){return 'error';}
        this.props.settings.format.colors[id] = numValues;
        this.props.updateColors();
    }
    private generateColorForms = () : JSX.Element => {
        const typeWidth = 3, rowHeight = '3rem'; let counter = 0;
        const addForm = () => {
            return this.forms.colors.map((rowGroup : any) => {
                const rowLabel = rowGroup[0], row = rowGroup[1];
                return (
                    <Row style={{maxHeight: rowHeight}} key={counter++}>
                        <Col sm={typeWidth} className="no-lr-padding" style={{maxHeight: rowHeight}}>
                            {rowLabel}</Col>
                    {row.map((form) => {
                        const id = form[0], label = form[1];
                        return(
                            <Col className="no-lr-padding" style={{maxHeight: rowHeight}} key={counter++}>
                            <ParameterForm
                                controlId={id} ariaLabel={`${label} ${rowLabel}`} type="number" 
                                newValue={String(this.props.settings.format.colors[id])} 
                                handleValueChange={this.handleColorChange} 
                                labelWidth={0}
                                style={{
                                    formLabel: {display: "inline-block"},
                                    formControl: {maxWidth: '6rem', display: "inline-block"},
                                    inputGroup: {display: "inline-block"},
                                    formGroup: {display: "inline-block", },
                                }}></ParameterForm></Col>
                        );
                    })}
                    </Row>
                );
            });
        }
        return (<>
            <Row style={{maxHeight: rowHeight}}>
                <Col sm={typeWidth} className="no-lr-padding" style={{maxHeight: rowHeight}}/>
                <Col className="no-lr-padding" style={{maxHeight: rowHeight}}>Minimum</Col>
                <Col className="no-lr-padding" style={{maxHeight: rowHeight}}>Maximum</Col>
            </Row>
            {addForm()}
        </>);
    }
    render(){
        const settings = this.props.settings, format = settings.format;
        let shortNamesDefault : string[] | undefined = undefined;
        if(format.shortNames){shortNamesDefault=["0"];}

        let showLineDefault : string[] | undefined = undefined;
        if(format.showLine){showLineDefault=["0"];}
        
        const open = this.state.open;
        return(<>
<Button style={{width: "100%", paddingTop: "0.6rem", paddingBottom: "0.6rem", height: "3rem"}}
        onClick={this.toggleCollapse} ref={this.scrollRef}
        aria-controls="collapseSettings"
        aria-expanded={open} variant="dark"
        className={open === true ? 'active' : ''}>{this.titles[Number(!open)] + 'Settings'}</Button>
<Collapse in={open}><div id="collapseSettings">
    <Container style={{maxWidth: '100%'}}><Row>
        <Col sm="6" style={{padding: 0}}>
            <h3>Graphs</h3>
            <Row>
                <Col style={{paddingRight: 0}}>
                    <h4>Line</h4>
                    <Row>
                        <Col sm="1"/>
                        <Col>
                    <ToggleButtonGroup type="checkbox" vertical defaultValue={showLineDefault}>
                        <ToggleButton value="0" onChange={this.handleShowLineChange} variant="secondary">Show Line</ToggleButton>
                    </ToggleButtonGroup>
                        </Col>
                        <Col sm="1"/>  
                    </Row>
                    <hr/><h4>Range Axis</h4>
                    {this.generateGraphForm()}
                </Col>
                <Col style={{padding: 0}}>
                    <h4>Labeling</h4>
                    <Row>
                    <Col sm="1"/>
                        <Col>
                            <ToggleButtonGroup type="checkbox" vertical defaultValue={shortNamesDefault}>
                                <ToggleButton value="0" onChange={this.handleShortNameChange} variant="secondary">Short Names</ToggleButton>
                            </ToggleButtonGroup>
                        </Col>
                    <Col sm="1"/>
                    </Row>
                    <ParameterForm 
                        controlId="rounding" ariaLabel="Tooltip Rounding" type="number" 
                        newValue={String(format.rounding)}
                        handleValueChange={this.handleRoundingChange} 
                        labelWidth={3} append="dp">
                        Tooltip Rounding
                    </ParameterForm>
                    <hr/><h4>Color Generation</h4>
                    {this.generateColorForms()}
                </Col>
            </Row>
        </Col>
        <Col style={{padding: 0}}>
            <h3>Calculations</h3>
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
    </Row></Container>
</div></Collapse> 
        </>);
    }
}

export default SettingsBar;