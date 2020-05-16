import React from 'react';
import {Scatter, defaults} from 'react-chartjs-2';
import Container from 'react-bootstrap/Container';

class SingleChart extends React.Component
<{config: Record<string, any>, title?: string,
dimensions: Record<string, number>}> {
    public static defaultProps = {
        config : {data: {datasets : [],}, options: {}}
    }
    state = {updateTrigger : true}
    //apparently you need a value in state or else set state doesn't trigger rerender

    chartRef : React.RefObject<Scatter> = React.createRef<Scatter>();
    update = () => {
        this.setState(this.state); //trigger rerender
    }
    render(){
        return(
            <>
                <Scatter data={this.props.config.data} options={this.props.config.options}
                width={this.props.dimensions.width} height={this.props.dimensions.height}
                ref={this.chartRef}/>
            </> 
        );
    }
    componentDidMount(){
        //console.log(this.chartRef.current);
    }
}


class ChartGroup extends React.Component
<{}>{
    state={updateTrigger: true}; //State needs value otherwise render won't trigger
    commonStyle = {};
    dimensions = {height: 300, width: 1200};
    chartConfigs : Record<string, Array<[Record<string, any>, React.RefObject<SingleChart>]>> = {
        impact: [
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
        ],
        angle: [
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
        ],
        post: [
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
        ]
    }
    //maybe use global so we don't have to GC as hard?
    updateData = (graphData) => {
        console.log(graphData, this.chartConfigs);
        //Common Utility Functions / Values
        const addCommas = (value, index, values) => {return value.toLocaleString();}
        const commonPointRadius = 0;
        const yAxesPenetration = {
            id: "Penetration", postition: "left",
            scaleLabel: {display: true,},
            ticks: {stepSize: 100, callback: addCommas}
        }
        const xAxesDistance = [{
            scaleLabel: {display: true,
                labelString: "Distance from Launch (m)",
            },
            type: 'linear',
            ticks:{callback: addCommas,}
        }];

        defaults.scatter.scales.xAxes[0] = xAxesDistance;
    
        const yAxesRightAngle = {
            id: "Angle", position: "right",
            scaleLabel: {display: true,},
        }

        //Impact Charts
        const impactData = graphData.impact; const configImpact = this.chartConfigs.impact;
        //0
        const  EPL = "Effective Penetration ";
        const IAL = "Impact Angle ";
        var hRAL0 = yAxesRightAngle; hRAL0.scaleLabel['labelString'] = "Belt Impact Angle (°)"; 
        var hRPL0 = yAxesPenetration; hRPL0.scaleLabel['labelString'] = "Belt Penetration (mm)";
        configImpact[0][0].options = {
            title: {display: true,
                text: 'Horizontal Penetration and Impact Angle'
            },
            scales: {yAxes: [hRPL0 , hRAL0]},
        };
        //1
        var vRAL1 = yAxesRightAngle; vRAL1.scaleLabel['labelString'] = "Deck Impact Angle (°)";
        var vRPL1 = yAxesPenetration; vRPL1.scaleLabel['labelString'] = "Deck Penetration (mm)";
        const EDP = "Effective Deck Penetration ";
        const DIA = "Deck Impact Angle ";
        configImpact[1][0].options = {
            title: {display: true,
                text: 'Deck Penetration and Impact Angle'
            },
            scales: {yAxes: [vRPL1, vRAL1]},
        }
        //2
        const IVL = "Impact Velocity "; const FTL = "Flight Time ";
        configImpact[2][0].options = {
            title: {display: true,
                text: 'Shell Flight Time and Impact Velocity'},
            scales: {
                yAxes: [{
                    id: "Impact Velocity", postition: "left",
                    scaleLabel: {display: true, labelString: "Impact Velocity (m/s)"},
                    ticks: {stepSize: 100}
                },{
                    id: "Time", position: "right",
                    scaleLabel: {display: true,
                        labelString: "Flight Time (s)",},
                }],
            }
        };

        //Angle
        const angleData = graphData.angle; const configAngle = this.chartConfigs.angle;
        const targetedArmor = 'Armor Thickness: ' + graphData.targets[0].armor + 'mm';
        const targetInclination = 'Vertical Inclination: ' + graphData.targets[0].inclination + '°'; 

        const ra0L = "Start Ricochet "
        const ra1L = "Always Ricochet "
        
        //0
        const armorL = "Maximum Perforation Angle ";
        configAngle[0][0].options = {
            title: {
                display: true,
                text: 'Maximum Angle for Perforation | ' + targetedArmor + ' | ' + targetInclination
            },
            scales: {
                //xAxes: xAxesDistance,
                yAxes: [{
                    id: "angle", postition: "left",
                    scaleLabel: {
                        display: true,
                        labelString: "Lateral Angle (°)",
                    },
                    ticks:{min: 0}
                }]
            },
        }

        //1
        const fuseL = "Minimum Fusing Angle ";
        configAngle[1][0].options = {
            title: {
                display: true,
                text: 'Minimum Fusing Angle | ' + targetedArmor + ' | ' + targetInclination
            },
            scales: {
                //xAxes: xAxesDistance,
                yAxes: [{
                    id: "angle", postition: "left",
                    scaleLabel: {
                        display: true,
                        labelString: "Lateral Angle (°)",
                    },
                    ticks:{min: 0}
                }],
            },
        }
        //Post-Penetration
        let addDeleteChart = false;
        const configPost = this.chartConfigs.post; const postData = graphData.post;
        const angleLengthDiff = graphData.angles.length - configPost.length;
        //console.log(this, configPost);
        if(angleLengthDiff > 0){
            for(let i=0; i<angleLengthDiff; i++){
                configPost.push([{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()]);
            }
            addDeleteChart = true;
        }else if(angleLengthDiff < 0){
            configPost.splice(angleLengthDiff, Math.abs(angleLengthDiff));
            addDeleteChart = true;
        }
        //console.log(angleLengthDiff, addDeleteChart);
        const WFL = "Fused ", NFL = "No Fusing ";
        configPost.forEach((value, i) => {
            value[0].data.datasets = []; // clear dataset
            value[0].data.datasets.push(
            {
                data: postData.shipWidth[0], showLine: true, borderDash: [5, 5], label: "Ship Width (m)",
                borderColor: "#505050", fill: false, pointRadius: commonPointRadius, pointHitRadius: 5
            });
            value[0].options = {
                title: {
                    display: true,
                    text: 'Internal Width Traveled before Detonation | ' + targetedArmor 
                    + ' | ' + targetInclination + ' | Horizontal Impact Angle: ' 
                    + graphData.angles[i] + "°"
                },
                scales: {
                    xAxes: xAxesDistance,
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Shell Detonation Distance (m)",
                        },
                    }],
                },
            }
        });

        //Setup Datasets
        configImpact.forEach((value) => {
            value[0].data.datasets = [];
        });
        configAngle.forEach((value) => {
            value[0].data.datasets = [];
        });
        //Add Lines
        const impactLine = (data : Array<Record<string, number>>, 
                            label: string, yAxisID : string, 
                            color : string = "") : Record<string, any> => {
            return {
                data: data, showLine: true, label: label, yAxisID: yAxisID, 
                fill: false, pointRadius: commonPointRadius, pointHitRadius: 5,
                borderColor: color
            };
        }
        const angleLine = (data : Array<Record<string, number>>, 
                            label: string, yAxisID : string, 
                            color : string = "") : Record<string, any> => {
            return {
                data: data, showLine: true, label: label, 
                yAxisID: "angle", //backgroundColor: Samples.utils.transparentize(colors[index][0]),
                borderColor: color, fill: false, pointRadius: commonPointRadius, pointHitRadius: 5
            }
        }
        const postLine = (data : Array<Record<string, number>>, 
            label: string, color : string = "", show : boolean = true) : Record<string, any> => {
            if(show){
                return {
                    data: data, showLine: true, label: label, 
                    borderColor: color, fill: false, pointRadius: commonPointRadius, pointHitRadius: 5
                };
            }else{
                return {
                    data: data, showLine: false, label: label, 
                    borderColor: color, fill: false, pointRadius: 0, pointHitRadius: 5
                };
            }
        }

        for(let i=0; i<graphData.numShells; i++){
            const name = graphData.names[i]; const colors = graphData.colors[i];
            //Impact
            configImpact[0][0].data.datasets.push(
                impactLine(impactData.ePenHN[i], EPL + name, "Penetration", colors[0]),
                impactLine(impactData.impactAHD[i], IAL + name, "Angle", colors[1]));
            configImpact[1][0].data.datasets.push(
                impactLine(impactData.ePenDN[i], EDP + name, "Penetration", colors[0]),
                impactLine(impactData.impactAHD[i], DIA + name, "Angle", colors[1]));
            configImpact[2][0].data.datasets.push(
                impactLine(impactData.impactV[i], IVL + name, "Impact Velocity", colors[0]),
                impactLine(impactData.tToTargetA[i], FTL + name, "Time", colors[1]));
            
            //Angle
            configAngle[0][0].data.datasets.push(
                angleLine(angleData.armorD[i], armorL + name, "angle", colors[0]),
                angleLine(angleData.ra0D[i], ra0L + name, "angle", colors[1]),
                angleLine(angleData.ra1D[i], ra1L + name, "angle", colors[2]),
            )
            configAngle[1][0].data.datasets.push(
                angleLine(angleData.fuseD[i], fuseL + name, "angle", colors[0]),
                angleLine(angleData.ra0D[i], ra0L + name, "angle", colors[1]),
                angleLine(angleData.ra1D[i], ra1L + name, "angle", colors[2]),
            )

            //Post
            configPost.forEach((value, index) => {
                //console.log(index);
                //console.log(postData.fused[index + graphData.angles.length*i]);
                //console.log(postData.notFused[index + graphData.angles.length*i]);

                let pL : Array<any> = [
                    postData.fused[index + graphData.angles.length*i],
                    postData.notFused[index + graphData.angles.length*i]
                ];
                let pLShow : boolean[] = [true, true];
                for(let j=0; j<2; j++){
                    if(pL[j].length === 0){
                        pL[j] = [{x: 0, y: 0}];
                        pLShow[j] = false;
                    }
                }

                value[0].data.datasets.push(
                    postLine(pL[0], WFL + name, colors[0], pLShow[0]),
                    postLine(pL[1], NFL + name, colors[1], pLShow[1]),
                )
            });
        }
        if(addDeleteChart){
            this.setState(this.state); //trigger re-render
        }else{
            this.updateCharts();
        }
    }
    updateCharts = () => {
        const updateImpact = (chart : number) => {
            const ref = this.chartConfigs.impact[chart][1];
            if(ref.current !== undefined){
                ref.current!.update();
            }
        }
        this.chartConfigs.impact.forEach((value, i) => {
            updateImpact(i);
        });
        const updateAngle = (chart : number) => {
            const ref = this.chartConfigs.angle[chart][1];
            if(ref.current !== undefined){
                ref.current!.update();
            }
        }
        this.chartConfigs.angle.forEach((value, i) => {
            updateAngle(i);
        });
        const updatePost = (chart : number) => {
            const ref = this.chartConfigs.post[chart][1];
            if(ref.current !== undefined){
                ref.current!.update();
            }
        }
        this.chartConfigs.post.forEach((value, i) => {
            updatePost(i);
        });
        
    }
    render(){
        return(
            <>
                <h3 style={{textAlign: "center"}}>Impact Charts</h3>
                {this.chartConfigs.impact.map((value, i) => {
                    return (<SingleChart config={value[0]} dimensions={this.dimensions} ref={value[1]} key={i}/>);
                })}
                <h3 style={{textAlign: "center"}}>Angle Charts</h3>
                {this.chartConfigs.angle.map((value, i) => {
                    return (<SingleChart config={value[0]} dimensions={this.dimensions} ref={value[1]} key={i}/>);
                })}
                <h3 style={{textAlign: "center"}}>Post Penetration Charts</h3>
                {this.chartConfigs.post.map((value, i) => {
                    return (<SingleChart config={value[0]} dimensions={this.dimensions} ref={value[1]} key={i}/>);
                })}
            </>
        );
    }
    /*componentDidUpdate(){
        console.log(this.chartConfigs);
    }*/
}

export default ChartGroup;