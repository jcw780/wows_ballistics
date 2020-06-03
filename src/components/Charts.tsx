import React from 'react';
import Chart from 'chart.js';
import {Scatter, defaults} from 'react-chartjs-2';
import {Button, Collapse, Row, Col} from 'react-bootstrap';

import * as T from './commonTypes';

//For downloading graphs as images
class DownloadButton extends React.Component<{updateData: Function, label: string}>{
    state = {href: '', download: ''} 
    update = (href, download) => {
        this.setState({href: href, download: download});
    }
    private click = () => {this.props.updateData()}
    render(){
        return (
            <a download={this.state.download} href={this.state.href}>
                <Button variant="outline-secondary" onClick={this.click}>
                    {this.props.label}
                </Button>
            </a>
        );
    }
}

interface singleChartProps{
    config: Record<string, any>, title?: string,
    dimensions: Record<string, number>
}
interface singleChartState{open: boolean}
export class SingleChart extends React.Component<singleChartProps, singleChartState> {
    public static defaultProps = {
        config : {data: {datasets : [],}, options: {}},
        title : ""
    }
    state = {open : true}; 
    //apparently you need a value in state or else set state doesn't trigger rerender
    valueIndex : number = 0; values : Readonly<Array<string>> = ["Hide: ", "Show: "]; // 0: Hide 1: Show

    chartRef : React.RefObject<Scatter> = React.createRef<Scatter>();
    scrollRef : React.RefObject<Button & HTMLButtonElement> = React.createRef<Button & HTMLButtonElement>();
    DownloadRef : React.RefObject<DownloadButton>[] = [
        React.createRef<DownloadButton>(), React.createRef<DownloadButton>()
    ];
    update = () => {
        this.setState(this.state); //trigger rerender
    }
    toggleCollapse = () => {
        if(this.state.open){this.valueIndex = 1;}
        else{this.valueIndex = 0;}
        this.setState((current) => {return {open: !current.open}});
    }
    updateDownloadGraph = () => {
        const url = this.chartRef.current!.chartInstance.toBase64Image();
        this.DownloadRef[0].current!.update(url, this.chartRef.current!.chartInstance.options.title.text + '.png');
    }
    updateDownloadJSON = () => {
        const data = this.chartRef.current!.chartInstance.config.data.datasets;
        const selectedData = data.map((line) => {return {label: line.label, data: line.data}});
        const url = URL.createObjectURL(new Blob([JSON.stringify(selectedData)], {type: 'text/json;charset=utf-8'}));
        this.DownloadRef[1].current!.update(url, this.chartRef.current!.chartInstance.options.title.text + '.json');
    }
    datasetKeyProvider = (dataset) => {
        // Fix bug where datasets with the same labels and different colors have the same colors
        return `${dataset.label}${dataset.borderColor}`;
    }
    render(){
        return(
            <>
                <Button style={{width: "100%", paddingTop: "0.6rem", paddingBottom: "0.6rem", height: "3rem"}}
                    onClick={this.toggleCollapse} ref={this.scrollRef} variant="dark"
                    aria-controls="collapseChart" 
                    aria-expanded={this.state.open}
                    className={this.state.open === true ? 'active' : ''}
                >{this.values[this.valueIndex] + this.props.title}</Button>
                <Collapse in={this.state.open}>
                    <div id="collapseChart">
                    <Scatter data={this.props.config.data} options={this.props.config.options}
                    width={this.props.dimensions.width} height={this.props.dimensions.height}
                    ref={this.chartRef} datasetKeyProvider={this.datasetKeyProvider}/>
                    <Row style={{margin: 0}}>
                        <Col sm="4" style={{padding: 0}}/>
                        <Col sm="2" style={{padding: 0}}><DownloadButton ref={this.DownloadRef[0]} updateData={this.updateDownloadGraph} 
                        label="Download Graph"/></Col>
                        <Col sm="2" style={{padding: 0}}><DownloadButton ref={this.DownloadRef[1]} updateData={this.updateDownloadJSON} 
                        label="Download Data"/></Col>
                        <Col sm="4" style={{padding: 0}}/>
                    </Row>
                    </div>
                </Collapse> 
            </> 
        );
    }
}

// Config Type for Chart Labels / Data
interface lineT {lineLabel: string, data: string}
interface axisT {id: string, axLabel?: string, lines: lineT[]}
interface configsT{title: string, axes: axisT[]}

// chartConfigs type
interface chartDataOption{data: Record<string, any>, options: Record<string, any>}
enum singleChartIndex {config, ref, name}
type singleChartType = [chartDataOption, React.RefObject<SingleChart>, string]

interface chartGroupProps{
    settings: Record<string, any>, links: T.linkT, onUpdate: Function
}
export class ChartGroup extends React.Component<chartGroupProps>{
    state={updateTrigger: true}; //State needs value otherwise render won't trigger
    commonStyle = {};
    dimensions = {height: 300, width: 1200};
    chartConfigs : Record<T.chartT, singleChartType[]> = {
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
    private callbackFunctions = {
        Penetration: (x, y) => {return `(${x}m, ${y}mm)`;},
        Angle: (x, y) => {return `(${x}m, ${y}°)`;},
        'Impact Velocity': (x, y) => {return `(${x}m, ${y}m/s)`;}, 
        Time: (x, y) => {return `(${x}m, ${y}s)`;},
        angle: (x, y) => {return `(${x}m, ${y}°)`;},
        detDist: (x, y) => {return `(${x}m, ${y}m)`;},
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
            value[2] = 'Horizontal Impact Angle ' + (i + 1);});
    }
    //maybe pass prop so we don't have to GC as hard?
    updateData = (graphData) => {
        //Common Utility Functions / Values
        const addCommas = (value, index, values) => {return value.toLocaleString();}
        const commonPointRadius = 0;
        const xAxesDistance = [{
            scaleLabel: {display: true, labelString: "Range (m)",},
            type: 'linear', ticks:{callback: addCommas}
        }];
        Object.entries(this.props.settings.distance).forEach(([key, value]) => {
            if(value !== null || true ){xAxesDistance[0].ticks[key] = value;}
        });
        //defaults.scatter.scales.xAxes[0] = xAxesDistance;
        const roundStringNumberWithoutTrailingZeroes = (num) => {
            const dp = this.props.settings.format.rounding ; num = String(num);
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
                    beforePoint = parts[0], afterPoint = parts[1],
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
            }else{return num;}
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
            {title: configImpact[0][singleChartIndex.name], axes: [
                    {id: 'Penetration', axLabel: 'Belt Penetration (mm)', 
                    lines: [{lineLabel: 'Effective Penetration ', data: 'ePenHN'}]},
                    {id: 'Angle', axLabel: 'Belt Impact Angle (°)', 
                    lines: [{lineLabel: 'Impact Angle ', data: 'impactAHD'}]}
                ],
            },
            {title: configImpact[1][singleChartIndex.name], axes : [
                    {id: 'Penetration', axLabel: 'Deck Penetration (mm)', 
                    lines: [{lineLabel: 'Effective Deck Penetration ', data: 'ePenDN'}]},
                    {id: 'Angle', axLabel: 'Deck Impact Angle (°)', 
                    lines: [{lineLabel: 'Deck Impact Angle ', data: 'impactADD'}]} 
                ],
            },
            {title: configImpact[2][singleChartIndex.name], axes : [ 
                    {id: 'Impact Velocity', axLabel: 'Impact Velocity (m/s)', 
                    lines: [{lineLabel: 'Impact Velocity ', data: 'impactV'}]},
                    {id: 'Time', axLabel: 'Flight Time (s)', 
                    lines: [{lineLabel: 'Flight Time ', data: 'tToTargetA'}]}
                ],
            },
        ]
        configImpact.forEach((chart, i) => {
            const chartLabels = impactConfigs[i]; const configs = chart[singleChartIndex.config];
            configs.options = {}; configs.options = setupImpact(chartLabels); configs.data.datasets = [];
        })
        //Angle
        const angleData = graphData.angle; const configAngle = this.chartConfigs.angle;
        const targetedArmor = `Armor Thickness: ${graphData.targets[0].armor}mm`;
        const targetInclination = `Vertical Inclination: ${graphData.targets[0].inclination}°`; 
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
            {title: `${configAngle[0][singleChartIndex.name]} | ${targetedArmor} | ${targetInclination}`, axes: [
                {id: 'angle',
                lines: [
                    {lineLabel: 'Maximum Perforation Angle ', data: 'armorD'}, 
                    {lineLabel: ra0L, data: 'ra0D'}, {lineLabel: ra1L, data: 'ra1D'}, 
                ]},
            ]}, 
            {title: `${configAngle[1][singleChartIndex.name]} | ${targetedArmor} | ${targetInclination}`, axes: [
                {id: 'angle',
                lines: [
                    {lineLabel: 'Minimum Fusing Angle ', data: 'fuseD'}, 
                    {lineLabel: ra0L, data: 'ra0D'}, {lineLabel: ra1L, data: 'ra1D'}, 
                ]},
            ]}
        ]
        configAngle.forEach((chart, i) => {
            const chartLabels = angleConfigs[i]; const config = chart[singleChartIndex.config];
            config.options = {}; config.options = setupAngle(chartLabels); config.data.datasets = [];
        });
        //Post-Penetration
        const configPost = this.chartConfigs.post; const postData = graphData.post;

        //Resizing chartConfigs.post and props.links upon addition or deletion of angles
        const angleLengthDiff = graphData.angles.length - configPost.length;
        if(angleLengthDiff > 0){
            for(let i=0; i<angleLengthDiff; i++){
                configPost.push([{data: {datasets : Array<any>(),}, options: {}}, React.createRef<SingleChart>(), '']);
                this.props.links.post.push(['', React.createRef<SingleChart>()]); // navbar links
            }
        }else if(angleLengthDiff < 0){
            configPost.splice(angleLengthDiff, Math.abs(angleLengthDiff));
            this.props.links.post.splice(angleLengthDiff, Math.abs(angleLengthDiff)); // navbar links
        }

        const WFL = "Fused ", NFL = "No Fusing ";
        configPost.forEach((chart, i) => {
            chart[singleChartIndex.config].data.datasets = []; // clear dataset
            chart[singleChartIndex.config].data.datasets.push( // add ship width line
            {
                data: postData.shipWidth[0], showLine: true, borderDash: [5, 5], label: "Ship Width", 
                yAxisID: 'detDist', borderColor: "#505050", fill: false, 
                pointRadius: commonPointRadius, pointHitRadius: 5 
            });
            chart[singleChartIndex.config].options = {};
            chart[singleChartIndex.config].options = {
                title: {
                    display: true,
                    text: 
                    `Internal Width Traveled before Detonation | ${targetedArmor} | ${targetInclination} | Horizontal Impact Angle: ${graphData.angles[i]}°`
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
            chart[singleChartIndex.name] = `Horizontal Impact Angle ${i + 1}: ${graphData.angles[i]}°`
        });
        //Add Lines
        const impactAngleLine = (data : Array<Record<string, number>>, 
                            label: string, yAxisID : string, 
                            color : string = "") : Record<string, any> => {
            return {
                data: data, showLine: true, label: label, yAxisID: yAxisID, 
                fill: false, pointRadius: commonPointRadius, pointHitRadius: 5,
                borderColor: color
            };
        }
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
            target.forEach((chart : singleChartType, rowIndex) => {
                configs[rowIndex].axes.forEach((axis, axisIndex) => {
                    axis.lines.forEach((line, lineIndex) => {
                        chart[singleChartIndex.config].data.datasets.push(impactAngleLine(
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
            configPost.forEach((chart, index) => { //Post
                let pL : Array<any> = [
                    postData.fused[index + graphData.angles.length*i],
                    postData.notFused[index + graphData.angles.length*i]
                ];
                let pLShow : boolean[] = [true, true];
                for(let j=0; j<2; j++){ //react-chartjs-2 doesn't like undefined data
                    if(pL[j].length === 0){pL[j] = [{x: 0, y: 0}]; pLShow[j] = false;}
                }
                chart[singleChartIndex.config].data.datasets.push(
                    postLine(pL[0], WFL + name, colors[0], pLShow[0]),
                    postLine(pL[1], NFL + name, colors[1], pLShow[1]),
                )
            });
        }
        this.setState(this.state); //graph updates completed, trigger re-render
    }
    updateCharts = () => {
        const trigger = (value : singleChartType, i) => {
            const ref = value[singleChartIndex.ref]; if(ref.current !== undefined){ref.current!.update();}
        }
        Object.entries(this.chartConfigs).forEach(([key, value]) => {value.forEach(trigger)});
    }
    render(){
        const addChart = (target : T.chartT) => {
            return this.chartConfigs[target].map((value, i) => {
                return (<SingleChart config={value[singleChartIndex.config]} dimensions={this.dimensions} 
                    ref={value[singleChartIndex.ref]} key={i} title={value[singleChartIndex.name]}/>);
            });
        }
        return(
            <>
                <h3 style={{textAlign: "center"}}>Impact Charts</h3>
                {addChart('impact')}
                <h3 style={{textAlign: "center"}}>Angle Charts</h3>
                {addChart('angle')}
                <h3 style={{textAlign: "center"}}>Post Penetration Charts</h3>
                {addChart('post')}
            </>
        );
    }
    componentDidMount(){
        //Initialize Links Names
        const setupNavbarCharts = (target : T.chartT) => {
            const link = this.props.links[target];
            this.chartConfigs[target].forEach((chart, i) => {
                if(link.length === i){ link.push(['', React.createRef<SingleChart>()]);}
                link[i][T.singleLinkIndex.name] = chart[singleChartIndex.name]; link[i][T.singleLinkIndex.ref] = chart[singleChartIndex.ref];
            });
        }
        Object.keys(this.chartConfigs).forEach((chartType : T.chartT) => {setupNavbarCharts(chartType)});
        //Preinitialize chart after mounting - to mitigate user confusion
        //Also due to the fact that getting wasm to run on startup is apparently impossible
        const initialJson = require('../static/initialData.json');
        this.updateData(initialJson);
    }
    componentDidUpdate(){
        this.chartConfigs.post.forEach((chart, i) => {
            this.props.links.post[i][T.singleLinkIndex.name] = chart[singleChartIndex.name]; 
            this.props.links.post[i][T.singleLinkIndex.ref] = chart[singleChartIndex.ref];
        });
        this.props.onUpdate();
    }
}

export default ChartGroup;