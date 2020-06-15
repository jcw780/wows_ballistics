import React from 'react';
import {Row, Col, Button, Modal, Container} from 'react-bootstrap';

import * as T from './commonTypes';
import {ParameterForm} from './ParameterForm';
import GeneralTooltip from './Tooltips';

interface refAngleFormProps {
    newValue: string[], index: number, keyProp : number, 
    handleValueChange: T.handleValueChangeT[], deleteElement : Function,
}
class RefAngleForm extends React.Component<refAngleFormProps>{
    deleteElement = () => {
        this.props.deleteElement(this.props.keyProp, this.props.index);
    }
    render(){
        return (
            <Modal.Dialog style={{width: '100%', margin: 0}}>
                <Modal.Header 
                style={{padding: 0, paddingTop: '0.5rem', paddingRight: '0.5rem', paddingLeft: '0.5rem'}}
                closeButton onHide={this.deleteElement}>
                    <Modal.Title style={{marginLeft: "40%", marginRight: "auto", }}>Label {this.props.index + 1}</Modal.Title>
                </Modal.Header>
            <Modal.Body>
            <ParameterForm controlId={this.props.index} 
            newValue={this.props.newValue[1]}
            handleValueChange={this.props.handleValueChange[1]} 
            type="text"
            labelWidth={4} style={{formControl: {width: '60%'}, formGroup: {flexFlow: 'unset'}}}>
                Text
            </ParameterForm>
            <ParameterForm controlId={this.props.index} 
            newValue={this.props.newValue[0]}
            handleValueChange={this.props.handleValueChange[0]} 
            type="number" 
            labelWidth={4} style={{formControl: {width: '60%'}, formGroup: {flexFlow: 'unset'}}} append="°">
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
    handleValueChange: T.handleValueChangeT, deleteElement : Function,
}
class AngleForm extends React.Component<angleFormProps>{
    deleteElement = () => {
        this.props.deleteElement(this.props.keyProp, this.props.index);
    }
    render(){
        return (
            <Modal.Dialog style={{width: '100%', margin: 0}}>
                <Modal.Header 
                style={{padding: 0, paddingTop: '0.5rem', paddingRight: '0.5rem', paddingLeft: '0.5rem'}}
                closeButton onHide={this.deleteElement}>
            <ParameterForm controlId={this.props.index} 
            newValue={this.props.newValue}
            handleValueChange={this.props.handleValueChange} 
            type="number"
            labelWidth={4} style={{formControl: {width: '60%'}, formGroup: {flexFlow: 'unset'}}} append="°">
                {this.props.label}
            </ParameterForm>
                </Modal.Header>
            </Modal.Dialog>
        );
    }
}
type multiFormT = 'angles' | 'refAngles';
interface targetFormsContainerState {
    keys: Record<multiFormT, Set<number>>
}
class TargetFormsContainer extends React.Component
<{}, targetFormsContainerState>{
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
    fixedTargetLabels = {
        armor: ['Armor Thickness', 'mm'],
        inclination: ['Armor Inclination', '°'],
        width: ['Target Width', 'm'],
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
    handleChange = (value : string, id : string) => {this.targetData[id] = parseFloat(value);}
    //Add and Delete General Functions
    addForm = (id : multiFormT) : void => {
        let index: number = 0;
        if(this.deletedKeys[id].length > 0){index = this.deletedKeys[id].pop()!;}
        else{index = this.state.keys[id].size;}
        //this.targetData.angles.push(this.targetData.angles.length * 5);
		this.setState((current) => {
            let set = current.keys[id]; set.add(index);
			return {...current, keys : {...current.keys, id: set}};
        });
    }
    deleteForm = (key: number, index: number, id : multiFormT) : void => {
        let set = this.state.keys[id];
        set.delete(key); this.deletedKeys[id].push(key);
        //this.targetData[id].splice(index, 1);
		this.setState((current) => {return {...current, keys : {...current.keys, [id]: set} }});
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
    handleAngleChange = (value: string, id : number) : void => {this.targetData.angles[id] = parseFloat(value);}

    //Label Angles
    addRefAngle = () => {
        this.targetData.refAngles.push(0);
        this.targetData.refLabels.push("");
        this.addForm('refAngles');
    }
    deleteRefAngle = (key : number, index : number) => {
        this.targetData.refAngles.splice(index, 1);
        this.targetData.refLabels.splice(index, 1)
        this.deleteForm(key, index, 'refAngles');
    }
    onRefAngleChange = (value: string, id : string) : void => {this.targetData.refAngles[id] = parseFloat(value);}
    onRefLabelChange = (value: string, id : string) : void => {this.targetData.refLabels[id] = value;}

    render(){
        const generateAngleElements = (elementsPerColumn : number) => {
            let angleElements : Array<Array<JSX.Element>> = [];
            Array.from(this.state.keys.angles).forEach((key, i) => {
                const columnIndex = Math.floor(i / elementsPerColumn);
                if(i % elementsPerColumn === 0){angleElements.push([]);}
                angleElements[columnIndex].push(
                    <AngleForm key={key} keyProp={key} index={i} 
                    newValue={String(this.targetData.angles[i])} deleteElement={this.deleteAngle}
                    handleValueChange={this.handleAngleChange}
                    label={`Angle ${i + 1}`}/> //start at 1 for display
                );
            });
            return angleElements;
        }
        const generateRefAngleElements = (elementsPerColumn : number) => {
            let angleElements : Array<Array<JSX.Element>> = [];
            Array.from(this.state.keys.refAngles).forEach((key, i) => {
                const columnIndex = Math.floor(i / elementsPerColumn);
                if(i % elementsPerColumn === 0){angleElements.push([]);}
                angleElements[columnIndex].push(
                    <RefAngleForm key={key} keyProp={key} index={i} 
                    newValue={[String(this.targetData.refAngles[i]), String(this.targetData.refLabels[i])]} 
                    deleteElement={this.deleteRefAngle}
                    handleValueChange={[this.onRefAngleChange, this.onRefLabelChange]}/>
                );
            });
            return angleElements;
        }
        const renderAngleElements = (angleElements) => {
            return angleElements.map((column, i) => {
                return (
                    <Col key={i} sm="3" style={{margin: 0, padding: 0}}>
                        {column.map((angleElement) => {
                            return angleElement;
                        })}
                    </Col>
                );
            });
        }

        const elementsPerColumn = 1;
        const angleElements = generateAngleElements(elementsPerColumn);
        const refAngleElements = generateRefAngleElements(elementsPerColumn);
        return(
        <>
            <h2 ref={this.scrollRef}>Target Parameters</h2>
            <Row>
                <Col sm={1}/>
            {Object.entries(this.fixedTargetLabels).map(([key, value], i) => {
                return (
                    <Col key={i}>
                        <ParameterForm controlId={key}
                        newValue={String(this.targetData[key])} 
                        handleValueChange={this.handleChange} type="number"
                        labelWidth={3} append={value[1]}>
                            {value[0]}
                        </ParameterForm>
                    </Col>
                );
            })}
                <Col sm={1}/>
            </Row>
            <GeneralTooltip title="Target Angles" content={
            <>
                Angle that target is presenting, adding or changing <br/> values affects post-penetration charts. <br/>
                Example: <br/>
                <table>
                    <tr>
                        <td>0</td><td>°</td><td>-</td><td>Full Broadside</td>
                    </tr>
                    <tr>
                        <td>45</td><td>°</td><td>-</td><td>Standard Start Ricochet*</td>
                    </tr>
                    <tr>
                        <td>60</td><td>°</td><td>-</td><td>Standard Always Ricochet*</td>
                    </tr>
                    <tr>
                        <td>90</td><td>°</td><td>-</td><td>Perfectly Angled</td>
                    </tr>
                </table>
                *At 0° angle of fall and 0° armor inclination.
            </>}
            ><h3 style={{display:"inline-block"}}>Target Angles</h3></GeneralTooltip>
            <Container style={{marginBottom: "1rem"}}>
                <Row>
            {renderAngleElements(angleElements)}
                </Row>
            </Container>
            
            <Row style={{marginBottom: "1rem"}}>
                <Col/>
                <Col sm="6"><Button className="form-control" variant="outline-secondary" onClick={this.addAngle}>
                    Add Angle</Button></Col>
                <Col/>
            </Row>
            <GeneralTooltip title="Angle Label" content={
                <>User generated labels for angle charts. 
                <br/>These do not affect calculation values.</>
            }><h3 style={{display:"inline-block"}}>Angle Labels</h3></GeneralTooltip>
            <Container style={{marginBottom: "1rem"}}>
                <Row>
            {renderAngleElements(refAngleElements)}
                </Row>
            </Container>
            <Row style={{marginBottom: "1rem"}}>
                <Col/>
                <Col sm="6"><Button className="form-control" variant="outline-secondary" onClick={this.addRefAngle}>
                    Add Angle</Button></Col>
                <Col/>
            </Row>
        </>
        );
    }

    /*componentDidUpdate(){
    }*/
}

export default TargetFormsContainer;