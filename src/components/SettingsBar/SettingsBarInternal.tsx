import React from 'react';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import {Row, Button} from 'react-bootstrap';

import * as T from '../commonTypes';
import {ParameterForm} from '../UtilityComponents';
import {SettingsRadio, CommonRadioFormat} from './SettingsRadio';
import {settingsBarProps} from './index';


const PositionRadio : React.FunctionComponent<{settings: T.settingsT}> = React.memo(({settings}) => {
    const options=['Top', 'Left', 'Bottom', 'Right'];
    const values=['top', 'left', 'bottom', 'right'];
    const {format} = settings;
    const onChange = (value) => {format.legendPosition = value;};
    return (
        <CommonRadioFormat>
            <SettingsRadio options={options} values={values}
                defaultValue={format.legendPosition}
                onChange={onChange}
            />
        </CommonRadioFormat>
    );
});
const CalculationRadio : React.FunctionComponent<{settings: T.settingsT}> = React.memo(({settings}) => {
    const options = ["Adams-Bashforth 5", "Forward Euler", "Runge-Kutta 2", "Runge-Kutta 4"];
    const values = [0, 1, 2, 3];
    const {calculationSettings} = settings;
    const onChange = (value) => {calculationSettings.calculationMethod = value;};
    return(
        <CommonRadioFormat>
            <SettingsRadio options={options} values={values}
                defaultValue={calculationSettings.calculationMethod}
                onChange={onChange}
            />
        </CommonRadioFormat>
    );
});
const VerticalTypeRadio : React.FunctionComponent<{settings: T.settingsT}> = React.memo(({settings}) => {
    const options = ["Horizontal Plane", "Impact Normal", "Vertical Plane"];
    const values = [0, 1, 2];
    const {calculationSettings} = settings;
    const onChange = (value: number) => {calculationSettings.verticalType = value;};
    return(
        <CommonRadioFormat>
            <SettingsRadio options={options} values={values}
                defaultValue={calculationSettings.verticalType}
                onChange={onChange}
            />
        </CommonRadioFormat>
    );
});

export class SettingsBarInternal extends React.PureComponent<settingsBarProps>{
    titles : T.collapseTitlesT = ["Hide: ", "Show: "]; // 0: Hide 1: Show
    private forms = Object.freeze({
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
    });
    private defaultFormStyle = Object.freeze({
        formLabel: {display: "block ruby", padding: 0},
        formControl: {minWidth: '50%', maxWidth: '6rem', display: "inline-flex"},
        inputGroup: {display: "inline-flex"},
        inputGroupAppend: {display: "inline-block"},
        formGroup: {display: "block ruby", marginBottom: ".5rem" },
    });
    private generateForms = (forms, target, onChange, sm=4) => {
        const rendered = forms.map((value, i) => {
            return(
                <React.Fragment key={i}>
                    <div>{value[1]}</div>
                    <div>
                        <ParameterForm 
                        controlId={value[0]} type="number" 
                        onChange={onChange} 
                        newValue={String(target[value[0]])} 
                        append={value[2]} 
                        labelWidth={3} ariaLabel={value[1]}
                        style={this.defaultFormStyle}
                        />
                    </div>
                </React.Fragment>
            );
        });
        const width = (sm / 12) * 100
        return (
            <div className="form-wrapper" style={{gridTemplateColumns: `${width}% ${100-width}%`}}>
                {rendered}
            </div>
        );
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
        let numValue : number | undefined;
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
        const {calculationSettings} = this.props.settings;
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
        const {calculationSettings} = this.props.settings;
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
        const addForm = () => {
            const singleRow = (rowGroup : any, j) => {
                const rowLabel = rowGroup[0], row = rowGroup[1];
                const singleForm = (form, i) => {
                    const id = form[0], label = form[1];
                    return(
                        <div className="color-box" key={i}>
                            <ParameterForm
                                controlId={id} 
                                ariaLabel={`${label} ${rowLabel}`} 
                                type="number" 
                                newValue={String(this.props.settings.format.colors[id])} 
                                onChange={this.handleColorChange} 
                                labelWidth={0}
                                style={this.defaultFormStyle}
                            />
                        </div>
                    );
                }
                return (
                    <React.Fragment key={j}>
                        <div className="color-box">
                            {rowLabel}
                        </div>
                        {row.map(singleForm)}
                    </React.Fragment>
                );
            }
            return this.forms.colors.map(singleRow);
        }
        return () => {
            return (
                <div className="color-wrapper">
                    <div className="color-box"/>
                    <div className="color-box">Minimum</div>
                    <div className="color-box">Maximum</div>
                    {addForm()}
                </div>
            )
        }
    }
    private generateColorForms = this.generateColorFormsInternal();
    render(){
        const {settings} = this.props, {format} = settings;
        return(
        <div>
            <div className="settings">
                <div className="graph-region">
                    <div className="graph-title">
                        <h3>Graphs</h3>
                    </div>
                    <div className="content-box">
                        <h4>Line</h4>
                        <BootstrapSwitchButton 
                            style='switch-toggle'
                            onlabel='Show Line' 
                            offlabel='Show Point' 
                            onstyle='success' 
                            offstyle='danger'
                            onChange={this.onShowLineChange} 
                            checked={settings.line.showLine}
                        />
                        <h5>Point</h5>
                        {this.generateLineForms()}
                    </div>
                    <div className="content-box">
                        <h4>Labeling</h4>
                        <BootstrapSwitchButton 
                            style='switch-toggle'
                            onlabel='Localized Names' 
                            offlabel='Gameparams Names' 
                            onstyle='success' 
                            offstyle='danger'
                            onChange={this.onShortNameChange} 
                            checked={format.shortNames}
                        />
                        <BootstrapSwitchButton 
                            style='switch-toggle'
                            onlabel='Hide Shell Names' 
                            offlabel='Show Shell Names' 
                            onstyle='success' 
                            offstyle='danger'
                            onChange={(checked: boolean) => {
                                this.props.settings.format.shellNames = checked;
                            }} 
                            checked={this.props.settings.format.shellNames}
                        />                
                        {this.generateFormatForms()}
                    </div>
                    <div className="content-box">
                        <h4>Legend Position</h4>
                        <PositionRadio settings={settings}/>
                    </div>
                    <div className="content-box">
                        <h4>Range Axis</h4>
                        {this.generateGraphForm()}
                    </div>
                    <div className="content-box">
                        <h4>Color Generation</h4>
                        {this.generateColorForms()}
                    </div>
                </div>
                <div className="calc-region">
                    <div className="calc-title">
                        <h3>Calculations</h3>
                    </div>
                    <div className="content-box">
                        <h4>Launch Angle</h4>
                        {this.generateLaunchAngleForm()}
                    </div>
                    <div className="content-box">
                        <h4>Numerical Analysis</h4>
                        <CalculationRadio settings={settings}/>
                        {this.generateNumericalMethodForm()}
                    </div>
                    <div className="content-box">
                        <h4>Dispersion Plane</h4>
                        <VerticalTypeRadio settings={settings}/>
                    </div>
                </div>
            </div>
            <Row className="justify-content-sm-center">
                <Button style={{width: "50%", paddingTop: "0.6rem", paddingBottom: "0.6rem", fontSize: "1.25rem"}}
                    variant="warning" onClick={() => {this.props.updateCharts();}}>
                    Update Graph Layouts
                </Button>
            </Row>
        </div>
        );
    }
}

export default SettingsBarInternal;