import React from 'react';
import Chart from 'chart.js';
import {Scatter, defaults} from 'react-chartjs-2';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';

//For downloading graphs as images
class DownloadButton extends React.Component<{updateData: Function}>{
    state = {href: '', download: ''} 
    update = (href, download) => {
        this.setState({href: href, download: download});
    }
    click = () => {
        this.props.updateData()
    }
    render(){
        return (
            <a download={this.state.download} href={this.state.href}>
                <Button onClick={this.click}>
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
                <DownloadButton ref={this.DownloadRef} updateData={this.updateDownload}/>
            </> 
        );
    }
    componentDidMount(){
        //this.updateDownload();
    }
    componentDidUpdate(){
        //this.updateDownload();
    }
    updateDownload = () => {
        const url = this.chartRef.current!.chartInstance.toBase64Image();
        this.graphDownload = this.chartRef.current!.chartInstance.options.title.text + '.png';
        this.graphHref = url;
        this.DownloadRef.current!.update(url, this.chartRef.current!.chartInstance.options.title.text + '.png');
    }
}

// Config Type for Chart Labels / Data
interface lineT {lineLabel: string, data: string}
interface axisT {id: string, axLabel?: string, lines: lineT[]}
interface configsT{title: string, axes: axisT[]}

// chartConfigs type
interface chartDataOption{data: Record<string, any>, options: Record<string, any>}
type singleChartType = [chartDataOption, React.RefObject<SingleChart>, string]

interface chartGroupProps{
    settings: Record<string, any>
}
class ChartGroup extends React.Component<chartGroupProps>{
    state={updateTrigger: true}; //State needs value otherwise render won't trigger
    commonStyle = {};
    dimensions = {height: 300, width: 1200};
    chartConfigs : Record<string, singleChartType[]> = {
        impact: [ //impact charts
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Horizontal Penetration and Impact Angle'],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Deck Penetration and Impact Angle'],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Shell Flight Time and Impact Velocity'],
        ],
        angle: [ //angle charts
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Maximum Angle for Perforation'],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), 'Minimum Fusing Angle'],
        ],
        post: [ //postpenetration charts
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), ''],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), ''],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), ''],
            [{data: {datasets : Array<any>(),}, options: {}}, 
                React.createRef<SingleChart>(), ''],
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
    callbackFunctions = {
        Penetration: (x, y) => {return '(' + x + 'm, ' + y + 'mm)';},
        Angle: (x, y) => {return '(' + x + 'm, ' + y + '°)';},
        'Impact Velocity': (x, y) => {return '(' + x + 'm, ' + y + 'm/s)';}, 
        Time: (x, y) => {return '(' + x + 'm, ' + y + 's)';},
        angle: (x, y) => {return '(' + x + 'm, ' + y + '°)';},
        detDist: (x, y) => {return '(' + x + 'm, ' + y + 'm)';},
    }
    constructor(props){
        super(props);
        defaults.global.animation = false;
        Chart.plugins.register({ //Allows viewing of downloaded image on bright backgrounds
            beforeDraw: function(chartInstance) {
                var ctx = chartInstance.chart.ctx;
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
            }
        });
        //Preinitialize postpenetration names
        this.chartConfigs.post.forEach((value, i) => {
            value[2] = 'Horizontal Impact Angle ' + (i + 1);
        })
    }
    //maybe pass prop so we don't have to GC as hard?
    updateData = (graphData) => {
        //Common Utility Functions / Values
        const addCommas = (value, index, values) => {return value.toLocaleString();}
        const commonPointRadius = 0;
        const xAxesDistance = [{
            scaleLabel: {display: true, labelString: "Distance from Launch (m)",},
            type: 'linear', ticks:{callback: addCommas}
        }];
        Object.entries(this.props.settings.distance).forEach((kv) => {
            const key: string = kv[0]; const value: any = kv[1];
            if(value != null){xAxesDistance[0].ticks[key] = value;}
        });
        defaults.scatter.scales.xAxes[0] = xAxesDistance;
        const roundStringNumberWithoutTrailingZeroes = (num) => {
            const dp = this.props.settings.rounding; num = String(num);
            if (dp > 0){
                if (num.indexOf('e+') !== -1) {
                    // Can't round numbers this large because their string representation
                    // contains an exponent, like 9.99e+37
                    throw new Error("num too large");
                }
                if (num.indexOf('.') === -1) {// Nothing to do
                    return num;
                }
                var parts = num.split('.'),
                    beforePoint = parts[0],
                    afterPoint = parts[1],
                    shouldRoundUp = afterPoint[dp] >= 5,
                    finalNumber;
                afterPoint = afterPoint.slice(0, dp);
                if (!shouldRoundUp) {
                    finalNumber = beforePoint + '.' + afterPoint;
                } else if (/^9+$/.test(afterPoint)) {
                    // If we need to round up a number like 1.9999, increment the integer
                    // before the decimal point and discard the fractional part.
                    finalNumber = String(Number(beforePoint)+1);
                } else {
                    // Starting from the last digit, increment digits until we find one
                    // that is not 9, then stop
                    var i = dp-1;
                    while (true) {
                        if (afterPoint[i] === '9') {
                            afterPoint = afterPoint.substr(0, i) +
                                        '0' +
                                        afterPoint.substr(i+1);
                            i--;
                        } else {
                            afterPoint = afterPoint.substr(0, i) +
                                        (Number(afterPoint[i]) + 1) +
                                        afterPoint.substr(i+1);
                            break;
                        }
                    }
                    finalNumber = beforePoint + '.' + afterPoint;
                }
                // Remove trailing zeroes from fractional part before returning
                return finalNumber.replace(/0+$/, '')
            }else{
                return num;
            }

        }
        const callbackFunction = (tooltipItem, chart) => {
            var x = tooltipItem.label; var y = tooltipItem.value;
            x = roundStringNumberWithoutTrailingZeroes(x); y = roundStringNumberWithoutTrailingZeroes(y);
            const namePS = (chart.datasets[tooltipItem.datasetIndex].label).split(' ');
            const name = namePS[namePS.length - 1];
            const callbackFunctions = this.callbackFunctions;
            return name + ' ' + callbackFunctions[chart.datasets[tooltipItem.datasetIndex].yAxisID](x, y);
        }
        const callbackColor = (tooltipItem, chart) => {
            const color = chart.config.data.datasets[tooltipItem.datasetIndex].borderColor;
            return {borderColor: color,backgroundColor: color}
        }
        //Impact Charts
        const impactData = graphData.impact; const configImpact = this.chartConfigs.impact;
        const setupImpact = (row) => {
            return {
                title: {display: true, text: row.title},
                scales: {xAxes: xAxesDistance, yAxes: [
                    {id: row.axes[0].id, position: "left", 
                        scaleLabel: {display: true, labelString: row.axes[0].axLabel}
                    }, 
                    {id: row.axes[1].id, position: "right", 
                        scaleLabel: {display: true, labelString: row.axes[1].axLabel}
                    },
                ]},
                tooltips: {callbacks: {label: callbackFunction, labelColor: callbackColor}}
            }
        }
        const impactConfigs : configsT[] = [
            {title: 'Horizontal Penetration and Impact Angle', axes: [
                    {id: 'Penetration', axLabel: 'Belt Penetration (mm)', 
                    lines: [{lineLabel: 'Effective Penetration ', data: 'ePenHN'}]},
                    {id: 'Angle', axLabel: 'Belt Impact Angle (°)', 
                    lines: [{lineLabel: 'Impact Angle ', data: 'impactAHD'}]}
                ],
            },
            {title: 'Deck Penetration and Impact Angle', axes : [
                    {id: 'Penetration', axLabel: 'Deck Penetration (mm)', 
                    lines: [{lineLabel: 'Effective Deck Penetration ', data: 'ePenDN'}]},
                    {id: 'Angle', axLabel: 'Deck Impact Angle (°)', 
                    lines: [{lineLabel: 'Deck Impact Angle ', data: 'impactADD'}]} 
                ],
            },
            {title: 'Shell Flight Time and Impact Velocity', axes : [ 
                    {id: 'Impact Velocity', axLabel: 'Impact Velocity (m/s)', 
                    lines: [{lineLabel: 'Impact Velocity ', data: 'impactV'}]},
                    {id: 'Time', axLabel: 'Flight Time (s)', 
                    lines: [{lineLabel: 'Flight Time ', data: 'tToTargetA'}]}
                ],
            },
        ]
        configImpact.forEach((value, i) => {
            const row = impactConfigs[i]; value[0].options = {}; value[0].options = setupImpact(row); value[0].data.datasets = [];
        })
        //Angle
        const angleData = graphData.angle; const configAngle = this.chartConfigs.angle;
        const targetedArmor = 'Armor Thickness: ' + graphData.targets[0].armor + 'mm';
        const targetInclination = 'Vertical Inclination: ' + graphData.targets[0].inclination + '°'; 
        const ra0L = "Start Ricochet "; const ra1L = "Always Ricochet ";

        const setupAngle = (row) => {
            return {
                title: {display: true, text: row.title},
                scales: {xAxes: xAxesDistance,
                    yAxes: [{id: "angle", postition: "left",
                        scaleLabel: {display: true, labelString: "Lateral Angle (°)",},
                        ticks:{min: 0}
                    }]
                },
                tooltips: {callbacks: {label: callbackFunction, labelColor: callbackColor}}
            }
        }
        const angleConfigs : configsT[] = [
            {title: 'Maximum Angle for Perforation | ' + targetedArmor + ' | ' + targetInclination, axes: [
                {id: 'angle',
                lines: [
                    {lineLabel: 'Maximum Perforation Angle ', data: 'armorD'}, 
                    {lineLabel: ra0L, data: 'ra0D'}, {lineLabel: ra1L, data: 'ra1D'}, 
                ]},
            ]}, 
            {title: 'Minimum Fusing Angle | ' + targetedArmor + ' | ' + targetInclination, axes: [
                {id: 'angle',
                lines: [
                    {lineLabel: 'Minimum Fusing Angle ', data: 'fuseD'}, 
                    {lineLabel: ra0L, data: 'ra0D'}, {lineLabel: ra1L, data: 'ra1D'}, 
                ]},
            ]}
        ]
        configAngle.forEach((value, i) => {
            const row = angleConfigs[i]; value[0].options = {}; value[0].options = setupAngle(row); value[0].data.datasets = [];
        });
        //Post-Penetration
        const configPost = this.chartConfigs.post; const postData = graphData.post;
        const angleLengthDiff = graphData.angles.length - configPost.length;
        if(angleLengthDiff > 0){
            for(let i=0; i<angleLengthDiff; i++){
                configPost.push([{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>(), '']);
            }
        }else if(angleLengthDiff < 0){
            configPost.splice(angleLengthDiff, Math.abs(angleLengthDiff));
        }

        const WFL = "Fused ", NFL = "No Fusing ";
        configPost.forEach((value, i) => {
            value[0].data.datasets = []; // clear dataset
            value[0].data.datasets.push( // add ship width line
            {
                data: postData.shipWidth[0], showLine: true, borderDash: [5, 5], label: "Ship Width", 
                yAxisID: 'detDist', borderColor: "#505050", fill: false, 
                pointRadius: commonPointRadius, pointHitRadius: 5 
            });
            value[0].options = {};
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
                        id: 'detDist',
                        scaleLabel: {
                            display: true,
                            labelString: "Shell Detonation Distance (m)",
                        },
                    }],
                },
                tooltips: {callbacks: {label: callbackFunction, labelColor: callbackColor}}
            }
            value[2] = "Horizontal Impact Angle " + (i + 1) + ": " + graphData.angles[i] + '°'
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
        /*const angleLine = (data : Array<Record<string, number>>, // no difference between impact and angle rn
                            label: string, yAxisID: string,      // fills are not implemented yet
                            color : string = "") : Record<string, any> => {
            return {
                data: data, showLine: true, label: label, 
                yAxisID: "angle", //backgroundColor: Samples.utils.transparentize(colors[index][0]),
                borderColor: color, fill: false, pointRadius: commonPointRadius, pointHitRadius: 5
            }
        }*/
        const postLine = (data : Array<Record<string, number>>, 
            label: string, color : string = "", show : boolean = true) : Record<string, any> => {
            if(show){return {
                    data: data, showLine: true, label: label, yAxisID: 'detDist',
                    borderColor: color, fill: false, pointRadius: commonPointRadius, pointHitRadius: 5
                };
            }else{return {
                    data: data, showLine: false, label: label, yAxisID: 'detDist',
                    borderColor: color, fill: false, pointRadius: 0, pointHitRadius: 0
                };
            }
        }
        const defaultColorFunction = (axisIndex: number, lineIndex: number) => {return axisIndex + lineIndex;}
        const assignPredefined = (shellIndex: number, name: string, target, configs : configsT[], 
            graphData, colors : string[], colorFunction=defaultColorFunction) => {
            target.forEach((value, rowIndex) => {
                configs[rowIndex].axes.forEach((axis, axisIndex) => {
                    axis.lines.forEach((line, lineIndex) => {
                        value[0].data.datasets.push(impactLine(
                            graphData[line.data][shellIndex], 
                            line.lineLabel + name, 
                            axis.id, 
                            colors[defaultColorFunction(axisIndex, lineIndex)]));
                    })
                })
            })
        }
        for(let i=0; i<graphData.numShells; i++){
            const name = graphData.names[i]; const colors = graphData.colors[i];
            assignPredefined(i, name, configImpact, impactConfigs, impactData, colors); //Impact
            assignPredefined(i, name, configAngle, angleConfigs, angleData, colors); //Angle
            configPost.forEach((value, index) => { //Post
                let pL : Array<any> = [
                    postData.fused[index + graphData.angles.length*i],
                    postData.notFused[index + graphData.angles.length*i]
                ];
                let pLShow : boolean[] = [true, true];
                for(let j=0; j<2; j++){ //react-chartjs-2 doesn't like undefined data
                    if(pL[j].length === 0){pL[j] = [{x: 0, y: 0}]; pLShow[j] = false;}
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
        const trigger = (value, i) => {
            const ref = value[1]; if(ref.current !== undefined){ref.current!.update();}
        }
        Object.entries(this.chartConfigs).forEach((kv) => {kv[1].forEach(trigger)});
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
    componentDidMount(){
        //Preinitialize chart after mounting
        const initialJson = require('./initialData.json');
        this.updateData(initialJson);
    }
    /*componentDidUpdate(){
        console.log(this.chartConfigs);
    }*/
}

export default ChartGroup;