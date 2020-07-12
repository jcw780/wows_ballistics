import React, {Suspense} from 'react';
import {Row, Col, Button, Modal} from 'react-bootstrap';
import {Icon} from 'semantic-ui-react';

import * as T from '../commonTypes';
import {ParameterForm} from '../UtilityComponents';
import "./TargetForms.css";
//import GeneralTooltip from './Tooltips';
const GeneralTooltip = React.lazy(() => import('../UtilityComponents/Tooltips'));

interface refAngleFormProps {
    newValue: string[], index: number, keyProp : number, 
    onChange: T.handleValueChangeT[], deleteElement : Function,
}
class RefAngleForm extends React.PureComponent<refAngleFormProps>{
    deleteElement = () => {
        this.props.deleteElement(this.props.keyProp, this.props.index);
    }
    private angleStyle = {
        formControl: {minWidth: '50%', maxWidth: '7rem', display: "inline-flex"},
        formGroup: {flexFlow: 'unset'}
    }
    render(){
        const {props} = this;
        return (
            <Modal.Dialog style={{width: '100%', margin: 0}}>
                <Modal.Header closeButton 
                    style={{padding: 0, paddingTop: '0.25rem', paddingRight: '0.25rem', paddingLeft: '0.25rem'}}
                    onHide={this.deleteElement}
                >
                    <Modal.Title style={{justifyContent: 'center'}}>Label {props.index + 1}</Modal.Title>
                </Modal.Header>
            <Modal.Body>
            <ParameterForm controlId={this.props.index} 
                newValue={props.newValue[1]}
                onChange={props.onChange[1]} 
                type="text" ariaLabel="Text"
                labelWidth={4} 
                style={{formControl: {width: '60%'}, formGroup: {flexFlow: 'unset'}}}
            >
                Text
            </ParameterForm>
            <ParameterForm controlId={this.props.index} 
                newValue={props.newValue[0]}
                onChange={props.onChange[0]} 
                type="number" ariaLabel="Angle"
                labelWidth={4} style={this.angleStyle} append="°"
            >
                Angle
            </ParameterForm>
            </Modal.Body>
            </Modal.Dialog>
        );
    }
}


interface angleFormProps {
    newValue: any, index: number, 
    label: string, keyProp : number, 
    onChange: T.handleValueChangeT, deleteElement : Function,
}
class AngleForm extends React.PureComponent<angleFormProps>{
    deleteElement = () => {
        this.props.deleteElement(this.props.keyProp, this.props.index);
    }
    private commonStyle = Object.freeze({
        formControl: {minWidth: '50%', maxWidth: '7rem', display: "inline-flex"},
        formGroup: {flexFlow: 'unset', padding: 0,},
        formLabel: {minWidth: '7rem'}
    });
    render(){
        const {props} = this;
        return (
            <Modal.Dialog style={{width: '100%', margin: 0, maxHeight: '57px'}}>
                <Modal.Header closeButton
                    style={{
                        padding: 0, 
                        paddingTop: '0.5rem', 
                        paddingRight: '0.5rem', 
                        paddingLeft: '0.5rem',
                        maxHeight: '100%'
                    }}
                    onHide={this.deleteElement}
                >
                    <ParameterForm controlId={props.index} 
                        newValue={props.newValue}
                        onChange={props.onChange} 
                        type="number" 
                        ariaLabel={props.label}
                        labelWidth={undefined} 
                        style={this.commonStyle} 
                        append="°"
                        >
                        {props.label}
                    </ParameterForm>
                </Modal.Header>
            </Modal.Dialog>
        );
    }
}
enum singleTargetI {name, unit, description};
type singleTargetT = [string, string, JSX.Element];
interface targetIntrinsicsT{
    armor: singleTargetT, inclination: singleTargetT, width: singleTargetT
}

type multiFormT = 'angles' | 'refAngles';
interface targetFormsContainerState {
    keys: Record<multiFormT, Set<number>>
}
export class TargetFormsContainer extends React.PureComponent<{}, targetFormsContainerState>{
    state = {
        keys: {
            angles: new Set(Array<number>()),
            refAngles : new Set(Array<number>())
        },
    };
    deletedKeys : Record<multiFormT, number[]> = {
        angles : [], refAngles : []
    }
    targetData : T.targetDataT = {
        armor: 70., inclination: 0.,
        width: 18., angles: Array<number>(8).fill(0),
        refAngles: Array<number>(), refLabels: Array<string>()
    };
    fixedTargetLabels : targetIntrinsicsT = {
        armor: ['Armor Thickness', 'mm', 
            <>
                Thickness of targeted armor
                <table id="tooltip-table">
                    <tbody>
                        <tr><th colSpan={2}>Examples</th></tr>
                        <tr><td>Yamato - Belt</td><td>410mm</td></tr>
                        <tr><td>Iowa - Belt</td><td>307mm</td></tr>
                    </tbody>
                </table>
            </>
        ],
        inclination: ['Armor Inclination', '°', 
            <>
                Inclination of target armor
                <table id="tooltip-table">
                    <tbody>
                        <tr><th colSpan={2}>Examples</th></tr>
                        <tr><td>Turtleback</td><td>Inclination {'>'} 0</td></tr>
                        <tr><td>Standard</td><td>Inclination {'≈'} 0</td></tr>
                    </tbody>
                </table>
            </>
        ],
        width: ['Target Width', 'm', 
            <>
                Width (Beam) of the targeted ship. <br/>
                *These do not affect calculation values.
                <table id="tooltip-table">
                    <tbody>   
                        <tr><th colSpan={2}>Examples</th></tr>
                        <tr><td>Yamato - Beam</td><td>38.9m</td></tr>
                        <tr><td>Iowa - Beam</td><td>33.0m</td></tr>
                    </tbody> 
                </table>
            </>    
        ],
    }
    scrollRef : React.RefObject<HTMLHeadingElement> = React.createRef<HTMLHeadingElement>();
    constructor(props){
        super(props);
        this.state.keys.angles = new Set(this.targetData.angles.map((value, i) => {
            this.targetData.angles[i] = i * 5;
            return i;
        }));
    }
    returnData = () => {return this.targetData;}
    private handleChange = (value : string, id : string) => {this.targetData[id] = parseFloat(value);}
    //Add and Delete General Functions
    addForm = (id : multiFormT) : void => {
        let index: number = 0;
        if(this.deletedKeys[id].length > 0){index = this.deletedKeys[id].pop()!;}
        else{index = this.state.keys[id].size;}
		this.setState((current) => {
            let set = current.keys[id]; set.add(index);
			return {...current, keys : {...current.keys, id: set}};
        });
    }
    deleteForm = (key: number, index: number, id : multiFormT) : void => {
        let set = this.state.keys[id];
        set.delete(key); this.deletedKeys[id].push(key);
		this.setState((current) => {return {...current, keys : {...current.keys, id: set} }});
    }

    //Target Angles
    addAngle = () => {
        this.targetData.angles.push(this.targetData.angles.length * 5);
        this.addForm('angles');
	}
	deleteAngle = (key : number, index : number) => {
        this.targetData.angles.splice(index, 1);
        this.deleteForm(key, index, 'angles');
    }
    private handleAngleChange = (value: string, id : number) : void => {this.targetData.angles[id] = parseFloat(value);}
    private generateAngleElements = (elementsPerColumn : number) => {
        const stateKeys = this.state.keys, {targetData} = this; let angleElements : Array<Array<JSX.Element>> = [];
        Array.from(stateKeys.angles).forEach((key, i) => {
            const columnIndex = Math.floor(i / elementsPerColumn);
            if(i % elementsPerColumn === 0){angleElements.push([]);}
            angleElements[columnIndex].push(
                <AngleForm key={key} keyProp={key} 
                    index={i} 
                    newValue={String(targetData.angles[i])} 
                    deleteElement={this.deleteAngle}
                    onChange={this.handleAngleChange}
                    label={`Angle ${i + 1}`}
                /> //start at 1 for display
            );
        });
        return angleElements;
    }
    //Label Angles
    addRefAngle = () => {
        this.targetData.refAngles.push(0);
        this.targetData.refLabels.push("");
        this.addForm('refAngles');
    }
    deleteRefAngle = (key : number, index : number) => {
        this.targetData.refAngles.splice(index, 1);
        this.targetData.refLabels.splice(index, 1);
        this.deleteForm(key, index, 'refAngles');
    }
    private onRefAngleChange = (value: string, id : string) : void => {this.targetData.refAngles[id] = parseFloat(value);}
    private generateRefAngleElements = (elementsPerColumn : number) => {
        const stateKeys = this.state.keys; let angleElements : Array<Array<JSX.Element>> = [];
        Array.from(stateKeys.refAngles).forEach((key, i) => {
            const columnIndex = Math.floor(i / elementsPerColumn);
            if(i % elementsPerColumn === 0) angleElements.push([]);
            angleElements[columnIndex].push(
                <RefAngleForm key={key} keyProp={key} 
                    index={i} 
                    newValue={[
                        String(this.targetData.refAngles[i]), 
                        String(this.targetData.refLabels[i])
                    ]} 
                    deleteElement={this.deleteRefAngle}
                    onChange={[this.onRefAngleChange, this.onRefLabelChange]}
                />
            );
        });
        return angleElements;
    }
    private onRefLabelChange = (value: string, id : string) : void => {this.targetData.refLabels[id] = value;}
    private renderAngleElements = (angleElements) => {
        return (
            <div className="angleLabel-wrapper">
            {angleElements.map((column, i) => {
                return (
                    <div key={i} className="angleLabel-box">
                        {column.map((angleElement) => {
                            return angleElement;
                        })}
                    </div>
                );
            })}
            </div>
        )
    }
    private renderFixedTargetLabels = () => {
        const {targetData} = this;
        const commonStyle = {
            formControl: {minWidth: '50%', maxWidth: '6rem', display: "inline-flex"},
            formGroup: {marginBottom: '0rem'}
        };
        const singleLabel = ([key, value], i) => {
            return (
                <div key={i}>
                    <ParameterForm controlId={key}
                        newValue={String(targetData[key])} 
                        onChange={this.handleChange} 
                        type="number"
                        labelWidth={5} 
                        append={value[1]} 
                        ariaLabel={value[0]} 
                        style={commonStyle}
                    >
                        <Suspense fallback={<div>Loading...</div>}>
                            <GeneralTooltip title={value[0]} content={value[singleTargetI.description]}>
                                <div>
                                    {value[0]}
                                    <Icon name='question circle outline' color='grey'/>
                                </div>
                            </GeneralTooltip>
                        </Suspense>
                    </ParameterForm>
                </div>
            );
        }
        return () => {
            return (
                <div className="fixedLabels-wrapper">
                    {Object.entries(this.fixedTargetLabels).map(singleLabel)}
                </div>
            );
        };
    }
    render(){
        const elementsPerColumn = 1;
        const angleElements = this.generateAngleElements(elementsPerColumn);
        const refAngleElements = this.generateRefAngleElements(elementsPerColumn);
        return(
        <>
            <h2 ref={this.scrollRef}>Target Parameters</h2>
            {this.renderFixedTargetLabels()()}
            <Suspense fallback={<div>Loading...</div>}>
                <GeneralTooltip title="Target Angles" content={
                <>
                    Angle that target is presenting, <br/>
                    adding or changing values affects <br/> 
                    post-penetration charts. <br/>
                    <table id="tooltip-table">
                        <tbody>
                            <tr><td>0° </td><td>Full Broadside           </td></tr>
                            <tr><td>45°</td><td>Standard Start Ricochet* </td></tr>
                            <tr><td>60°</td><td>Standard Always Ricochet*</td></tr>
                            <tr><td>90°</td><td>Perfectly Angled         </td></tr>
                        </tbody>
                    </table>
                    *0° angle of fall and armor inclination.
                </>}>
                    <div>
                        <h3 style={{display:"inline-block"}}>Target Angles</h3>
                        <Icon name='question circle outline' color='grey'/>
                    </div>
                </GeneralTooltip>
            </Suspense>

            {this.renderAngleElements(angleElements)}

            <Row className="justify-content-sm-center no-lr-margin" style={{marginBottom: "1rem"}}>
                <Col sm="6">
                    <Button className="form-control" variant="outline-secondary" onClick={this.addAngle}>
                        Add Angle
                    </Button>
                </Col>
            </Row>
            <Suspense fallback={<div>Loading...</div>}>
                <GeneralTooltip title="Angle Label" content={
                    <>User generated labels for angle charts. 
                    <br/>These do not affect calculation values.</>}
                >
                    <div>
                        <h3 style={{display:"inline-block", marginBottom: 0}}>Angle Labels</h3>
                        <Icon name='question circle outline' color='grey'/>
                    </div>
                </GeneralTooltip>
            </Suspense>

            {this.renderAngleElements(refAngleElements)}
            
            <Row className="justify-content-sm-center no-lr-margin" style={{marginBottom: "1rem"}}>
                <Col sm="6">
                    <Button className="form-control" variant="outline-secondary" onClick={this.addRefAngle}>
                        Add Angle
                    </Button>
                </Col>          
            </Row>
        </>
        );
    }

    /*componentDidUpdate(){
    }*/
}

export default TargetFormsContainer;