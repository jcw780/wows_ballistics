import React from 'react';
import Chart from 'chart.js';
import {Scatter, defaults} from 'react-chartjs-2';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';

class DownloadButton extends React.Component{
    state = {href: '', download: ''} 
    update = (href, download) => {
        this.setState({href: href, download: download});
    }
    render(){
        return (
            <a download={this.state.download} href={this.state.href}>
                <Button>
                    Download Graph
                </Button>
            </a>
        );
    }
    componentDidUpdate(){
        //console.log('updated', this.state.href);
    }
}

interface singleChartProps{
    config: Record<string, any>, title?: string,
    dimensions: Record<string, number>
}
interface singleChartState{
    open: boolean
}
class SingleChart extends React.Component<singleChartProps, singleChartState> {
    public static defaultProps = {
        config : {data: {datasets : [],}, options: {}},
        title : ""
    }
    state = {open : true}; 
    //apparently you need a value in state or else set state doesn't trigger rerender
    valueIndex : number = 0; values : Readonly<Array<string>> = ["", ""]; // 0: Hide 1: Show
    graphHref: string = ''; graphDownload: string = '.png'

    chartRef : React.RefObject<Scatter> = React.createRef<Scatter>();
    DownloadRef : React.RefObject<DownloadButton> = React.createRef<DownloadButton>();
    update = () => {
        this.setState(this.state); //trigger rerender
    }
    toggleCollapse = () => {
        if(this.state.open){
            this.valueIndex = 1;
        }else{
            this.valueIndex = 0;
        }
        this.setState((current) => {return {open: !current.open}});
    }

    render(){
        //this.props.config.options.animations = {duration: 0};
        this.props.config.options.plugins = [{
            afterRender : function () {
                this.updateDownload();
            }
        }]
        return(
            <>
                <Button style={{width: "100%", paddingTop: "0.6rem", paddingBottom: "0.6rem", height: "3rem"}}
                    onClick={this.toggleCollapse}
                    aria-controls="collapseChart"
                    aria-expanded={this.state.open}
                    className={this.state.open === true ? 'active' : ''}
                >{this.values[this.valueIndex] + this.props.title}</Button>
                <Collapse in={this.state.open}>
                    <div id="collapseChart">
                    <Scatter data={this.props.config.data} options={this.props.config.options}
                    width={this.props.dimensions.width} height={this.props.dimensions.height}
                    ref={this.chartRef}/>
                    </div>
                </Collapse> 
                <DownloadButton ref={this.DownloadRef}/>
            </> 
        );
    }
    componentDidMount(){
        this.updateDownload();
    }
    componentDidUpdate(){
        this.updateDownload();
    }
    updateDownload = () => {
        //console.log(this.chartRef);
        const url = this.chartRef.current!.chartInstance.toBase64Image();
        this.graphDownload = this.chartRef.current!.chartInstance.options.title.text + '.png';
        this.graphHref = url;
        //this.updateDownload();
        this.DownloadRef.current!.update(url, this.chartRef.current!.chartInstance.options.title.text + '.png');
    }
}

interface chartGroupProps{
    settings: Record<string, any>
}
class ChartGroup extends React.Component<chartGroupProps>{
    state={updateTrigger: true}; //State needs value otherwise render won't trigger
    commonStyle = {};
    dimensions = {height: 300, width: 1200};
    chartConfigs : Record<string, Array<[Record<string, any>, React.RefObject<SingleChart>, string]>> = {
        impact: [
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Horizontal Penetration and Impact Angle'],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Deck Penetration and Impact Angle'],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Shell Flight Time and Impact Velocity'],
        ],
        angle: [
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Maximum Angle for Perforation'],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Minimum Fusing Angle'],
        ],
        post: [
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), ''],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), ''],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), ''],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), ''],
        ]
    }
    constructor(props){
        super(props);
        defaults.global.animation = false;
        Chart.plugins.register({
            beforeDraw: function(chartInstance) {
                var ctx = chartInstance.chart.ctx;
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
            }
        });
    }

    //maybe pass prop so we don't have to GC as hard?
    updateData = (graphData) => {
        console.log(graphData, this.chartConfigs);
        //Common Utility Functions / Values
        const addCommas = (value, index, values) => {return value.toLocaleString();}
        const commonPointRadius = 0;
        const xAxesDistance = [{
            scaleLabel: {display: true,
                labelString: "Distance from Launch (m)",
            },
            type: 'linear', ticks:{callback: addCommas}
        }];
        Object.entries(this.props.settings.distance).forEach((kv) => {
            const key: string = kv[0]; const value: any = kv[1];
            if(value != null){
                xAxesDistance[0].ticks[key] = value;
            }
        });

        defaults.scatter.scales.xAxes[0] = xAxesDistance;
        console.log(defaults);
    
        /*const yAxesRightAngle = Object.freeze({
            id: "Angle", position: "right",
            scaleLabel: {display: true,},
        });*/

        //Impact Charts
        const impactData = graphData.impact; const configImpact = this.chartConfigs.impact;
        //0
        const  EPL = "Effective Penetration ";
        const IAL = "Impact Angle ";
        configImpact[0][0].options = {
            title: {display: true,
                text: 'Horizontal Penetration and Impact Angle'
            },
            scales: {xAxes: xAxesDistance, yAxes: [
                        {id: "Penetration", position: "left", 
                            scaleLabel: {display: true, labelString: "Belt Penetration (mm)"}
                        }, 
                        {id: "Angle", position: "right", 
                            scaleLabel: {display: true, labelString: "Belt Impact Angle (°)"}
                        },
                    ]},
        };
        //1
        const EDP = "Effective Deck Penetration ";
        const DIA = "Deck Impact Angle ";
        configImpact[1][0].options = {
            title: {display: true,
                text: 'Deck Penetration and Impact Angle'
            },
            scales: {xAxes: xAxesDistance, yAxes: [
                        {id: "Penetration", position: "left", 
                            scaleLabel: {display: true, labelString: "Deck Penetration (mm)"}
                        }, 
                        {id: "Angle", position: "right", 
                            scaleLabel: {display: true, labelString: "Deck Impact Angle (°)"}
                        },
                    ]},
        }
        //2
        const IVL = "Impact Velocity "; const FTL = "Flight Time ";
        configImpact[2][0].options = {
            title: {display: true,
                text: 'Shell Flight Time and Impact Velocity'},
            scales: {xAxes: xAxesDistance,
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
        const ra0L = "Start Ricochet "; const ra1L = "Always Ricochet ";

        //0
        const armorL = "Maximum Perforation Angle ";
        configAngle[0][0].options = {
            title: {
                display: true,
                text: 'Maximum Angle for Perforation | ' + targetedArmor + ' | ' + targetInclination
            },
            scales: {xAxes: xAxesDistance,
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
            scales: {xAxes: xAxesDistance,
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
        //let addDeleteChart = false;
        const configPost = this.chartConfigs.post; const postData = graphData.post;
        const angleLengthDiff = graphData.angles.length - configPost.length;
        //console.log(this, configPost);
        if(angleLengthDiff > 0){
            for(let i=0; i<angleLengthDiff; i++){
                configPost.push([{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>(), '']);
            }
            //addDeleteChart = true;
        }else if(angleLengthDiff < 0){
            configPost.splice(angleLengthDiff, Math.abs(angleLengthDiff));
            //addDeleteChart = true;
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
            value[2] = "Horizontal Impact Angle " + i + ": " + graphData.angles[i] + '°'
        });
        console.log(configPost);
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
                impactLine(impactData.impactADD[i], DIA + name, "Angle", colors[1]));
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
        this.setState(this.state); //trigger re-render
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
                    return (<SingleChart config={value[0]} dimensions={this.dimensions} ref={value[1]} key={i} title={value[2]}/>);
                })}
                <h3 style={{textAlign: "center"}}>Angle Charts</h3>
                {this.chartConfigs.angle.map((value, i) => {
                    return (<SingleChart config={value[0]} dimensions={this.dimensions} ref={value[1]} key={i} title={value[2]}/>);
                })}
                <h3 style={{textAlign: "center"}}>Post Penetration Charts</h3>
                {this.chartConfigs.post.map((value, i) => {
                    return (<SingleChart config={value[0]} dimensions={this.dimensions} ref={value[1]} key={i} title={value[2]}/>);
                })}
            </>
        );
    }
    /*componentDidUpdate(){
        console.log(this.chartConfigs);
    }*/
}

export default ChartGroup;