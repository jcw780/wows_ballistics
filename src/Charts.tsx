import React from 'react';
import {Scatter, defaults} from 'react-chartjs-2';
import Container from 'react-bootstrap/Container';

class SingleChart extends React.Component
<{config: Record<string, any>, title?: string,
dimensions: Record<string, number>}> {
    public static defaultProps = {
        config : {data: {datasets : [],}, options: {}}
    }
    state = {
        updateTrigger : true,
    }
    chartRef : React.RefObject<Scatter> = React.createRef<Scatter>();
    update = () => {
        //console.log(this.props.config);
        //console.log(this.chartRef.current);
        this.setState((current) => {
            return {updateTrigger : !current['updateTrigger']};
        });
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
    commonStyle = {};
    dimensions = {height: 300, width: 1200};
    chartConfigs : Record<string, Array<[Record<string, any>, React.RefObject<SingleChart>]>> = {
        impact: [
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
            [{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>()],
        ],
    }
    updateData = (graphData) => {
        console.log(graphData, this.chartConfigs);
        //Common Utility Functions / Values
        const addCommas = (value, index, values) => {return value.toLocaleString();}
        const commonPointRadius = 0;
        const yAxesPenetration = {
            id: "Penetration", postition: "left",
            scaleLabel: {display: true,},
            ticks: {stepSize: 100,
                callback: addCommas,
            }
        }
        const xAxesDistance = [{
            scaleLabel: {display: true,
                labelString: "Distance from Launch (m)",
            },
            ticks:{callback: addCommas,}
        }];

        defaults.scatter.scales.xAxes[0] = xAxesDistance;
    
        const yAxesRightAngle = {
            id: "Angle", position: "right",
            scaleLabel: {display: true,},
        }

        //Impact Charts
        //0
        const  EPL = "Effective Penetration ";
        const IAL = "Impact Angle ";
        var hRAL0 = yAxesRightAngle; hRAL0.scaleLabel['labelString'] = "Belt Impact Angle (°)"; 
        var hRPL0 = yAxesPenetration; hRPL0.scaleLabel['labelString'] = "Belt Penetration (mm)";
        this.chartConfigs.impact[0][0].options = {
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
        this.chartConfigs.impact[1][0].options = {
            title: {display: true,
                text: 'Deck Penetration and Impact Angle'
            },
            scales: {yAxes: [vRPL1, vRAL1]},
        }
        //2
        const IVL = "Impact Velocity "; const FTL = "Flight Time ";
        this.chartConfigs.impact[2][0].options = {
            title: {display: true,
                text: 'Shell Flight Time and Impact Velocity'
            },
            scales: {
                yAxes: [{
                    id: "Impact Velocity", postition: "left",
                    scaleLabel: {display: true,
                        labelString: "Impact Velocity (m/s)",
                    },
                    ticks: {stepSize: 100}
                },{
                    id: "Time", position: "right",
                    scaleLabel: {display: true,
                        labelString: "Flight Time (s)",
                    },
                }],
            }
        };

        this.chartConfigs.impact[0][0].data.datasets = [];
        this.chartConfigs.impact[1][0].data.datasets = [];
        this.chartConfigs.impact[2][0].data.datasets = [];
        const impactLine = (data : Array<Record<string, number>>, 
                            label: string, yAxisID : string, 
                            color : string = "") : Record<string, any> => {
            return {
                data: data, showLine: true, label: label, yAxisID: yAxisID, 
                fill: false, pointRadius: commonPointRadius, pointHitRadius: 5,
                borderColor: color
            };

        }

        for(let i=0; i<graphData.numShells; i++){
            const name = graphData.names[i]; const colors = graphData.colors[i];
            const impactData = graphData.impact;
            console.log(graphData.colors, colors);
            this.chartConfigs.impact[0][0].data.datasets.push(
                impactLine(impactData.ePenHN[i], EPL + name, "Penetration", colors[0]),
                impactLine(impactData.impactAHD[i], IAL + name, "Angle", colors[1]));
            this.chartConfigs.impact[1][0].data.datasets.push(
                impactLine(impactData.ePenDN[i], EDP + name, "Penetration", colors[0]),
                impactLine(impactData.impactAHD[i], DIA + name, "Angle", colors[1]));
            this.chartConfigs.impact[2][0].data.datasets.push(
                impactLine(impactData.impactV[i], IVL + name, "Impact Velocity", colors[0]),
                impactLine(impactData.tToTargetA[i], FTL + name, "Time", colors[1]));
        }
        this.updateCharts();
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

    }
    render(){
        return(
            <>
                <h3 style={{textAlign: "center"}}>Impact Charts</h3>
                {this.chartConfigs.impact.map((value, i) => {
                    return (<SingleChart config={value[0]} dimensions={this.dimensions} ref={this.chartConfigs.impact[i][1]} key={i}/>);
                })}
            </>
        );
    }
    componentDidMount(){
        //console.log(this, defaults);
    }
}

export default ChartGroup;