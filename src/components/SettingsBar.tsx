import React from 'react';
import {Button, ToggleButtonGroup, ToggleButton, Collapse, Container, Col, Row} from 'react-bootstrap';

import * as T from './commonTypes';
import {ParameterForm} from './ParameterForm';

class CalculationRadio extends React.Component<{settings: T.settingsT}, {value: number}>{
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
            <Row style={{paddingLeft: '1rem', paddingRight: '1rem'}}>
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
export class SettingsBar extends React.Component<settingsBarProps, settingsBarState>{
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
        }
    }
    render(){
        const settings = this.props.settings, calculationSettings = settings.calculationSettings, 
            format = settings.format, colorSettings = format.colors;
        const forms = this.forms;
        const handleGraphChange = (value: string, id: string) => {
            var numValue : number | undefined;
            if(value === ''){numValue = undefined;} 
            else{numValue = parseFloat(value);}
            settings.distance[id] = numValue; 
        }
        const generateGraphForm = () => {
            const rangeAxisFormStyle = {formLabel: {paddingTop: 0, paddingBottom: 0}, formGroup: {marginBottom: ".5rem"}};
            return forms.graphs.distance.map((value, i) => {
                return(
                    <ParameterForm 
                    controlId={value[0]} key={i} type="number" 
                    handleValueChange={handleGraphChange} 
                    newValue={String(settings.distance[value[0]])} 
                    append="m" 
                    labelWidth={3} style={rangeAxisFormStyle} ariaLabel={value[1]}>
                        {value[1]}
                    </ParameterForm>
                );
            });
        }
        const handleCalculationChange = (value: string, id: string) : void | string => {
            if(value === ''){return 'error';}
            const numValue = parseFloat(value);
            calculationSettings.launchAngle[id] = numValue;
        }
        const handleNumericalMethodChange = (value: string, id: string) : void | string => {
            if(value === ''){return 'error';}
            const numValue = parseFloat(value);
            if(id === 'timeStep'){
                if(numValue <= 0){return 'error';}
                calculationSettings.timeStep = numValue;
            }
        }
        const generateLaunchAngleForm = () => {
            return forms.calculations.launchAngle.map((value, i) => {
                const initialValue = calculationSettings.launchAngle[value[0]];
                return(
                    <ParameterForm 
                    controlId={value[0]} key={i} type="number" 
                    newValue={String(initialValue)} 
                    handleValueChange={handleCalculationChange} 
                    labelWidth={3} append={value[2]} ariaLabel={value[1]}>
                        {value[1]}
                    </ParameterForm>
                );
            });
        }
        const generateNumericalMethodForm = () => {
            return forms.calculations.numericalMethod.map((value, i) => {
                const initialValue = settings.calculationSettings[value[0]];
                return(
                    <ParameterForm newValue={String(initialValue)} controlId={value[0]} key={i} ariaLabel={value[1]}
                    type="number" handleValueChange={handleNumericalMethodChange} labelWidth={3} append={value[2]}>
                        {value[1]}
                    </ParameterForm>
                );
            });
        }
        const handleRoundingChange = (value: string, id: string) : void | string => {
            let numValue : number | null = parseInt(value);
            if(numValue < 0){return 'error';} if(value === ''){numValue = null;}
            format.rounding = numValue; 
        } 
        const handleShortNameChange = (event) => {format.shortNames = event.target.checked;}
        let shortNamesDefault : string[] | undefined = undefined;
        if(format.shortNames){shortNamesDefault=["0"];}

        const handleShowLineChange = (event) => {format.showLine = event.target.checked;}
        let showLineDefault : string[] | undefined = undefined;
        if(format.showLine){showLineDefault=["0"];}
        
        const handleColorChange = (value: string, id: string) : void | string => {
            if(value === ''){return 'error';}
            const numValues = parseFloat(value) / 100;
            if(numValues > 1 || numValues < 0){return 'error';}
            colorSettings[id] = numValues;
            this.props.updateColors();
        }

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
                        <ToggleButton value="0" onChange={handleShowLineChange} variant="secondary">Show Line</ToggleButton>
                    </ToggleButtonGroup>
                        </Col>
                        <Col sm="1"/>  
                    </Row>
                    <h4>Range Axis</h4>
                    {generateGraphForm()}
                </Col>
                <Col style={{padding: 0}}>
                    <h4>Labeling</h4>
                    <Row>
                    <Col sm="1"/>
                        <Col>
                            <ToggleButtonGroup type="checkbox" vertical defaultValue={shortNamesDefault}>
                                <ToggleButton value="0" onChange={handleShortNameChange} variant="secondary">Short Names</ToggleButton>
                            </ToggleButtonGroup>
                        </Col>
                    <Col sm="1"/>
                    </Row>
                    <ParameterForm 
                        controlId="rounding" ariaLabel="Tooltip Rounding" type="number" 
                        newValue={String(format.rounding)}
                        handleValueChange={handleRoundingChange} 
                        labelWidth={3} append="dp">
                        Tooltip Rounding
                    </ParameterForm>
                    <h4>Color Generation</h4>
                    <ParameterForm
                        controlId="saturation" ariaLabel="Saturation" type="number" 
                        newValue={String(colorSettings.saturation * 100)}
                        handleValueChange={handleColorChange} 
                        labelWidth={3} append="%">
                        Saturation
                    </ParameterForm>
                    <ParameterForm 
                        controlId="light" ariaLabel="Light" type="number" 
                        newValue={String(colorSettings.light * 100)} 
                        handleValueChange={handleColorChange} 
                        labelWidth={3} append="%">
                        Light
                    </ParameterForm>
                </Col>
            </Row>
        </Col>
        <Col style={{padding: 0}}>
            <h3>Calculations</h3>
            <Row>
                <Col style={{padding: 0}}>
                    <h4>Launch Angle</h4>
                    {generateLaunchAngleForm()}
                </Col>
                <Col sm="6" style={{paddingRight: 0, paddingLeft: 0}}>
                    <h4>Numerical Analysis</h4>
                    <CalculationRadio settings={settings}/>
                    {generateNumericalMethodForm()}
                </Col>
            </Row>
        </Col>
    </Row></Container>
</div></Collapse> 
        </>);
    }
}

export default SettingsBar;