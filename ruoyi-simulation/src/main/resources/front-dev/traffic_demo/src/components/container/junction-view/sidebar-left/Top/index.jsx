import React, { useEffect, useState } from 'react';
import { ReactComponent as CarIcon } from '../../../../../assets/icon/icon-car.svg';
import { ReactComponent as TriangleIcon } from '../../../../../assets/icon/icon-triangle.svg';
import { ReactComponent as NavIcon } from '../../../../../assets/icon/icon-nav.svg';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import * as echarts from 'echarts';
import './style.scss';


export default function Index(props) {

    const generateRandomArray = (length, min, max) => {
        return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    };

    const [randomCurrent, setRandomCurrent] = useState(generateRandomArray(12, 0, 300));
    const [randomToday, setRandomToday] = useState(generateRandomArray(12, 0, 250));
    useEffect(() => {
        const chartData = [
            { name: '溢流指数', value: 3.1, center: ['12.5%', '50%'] },
            { name: '过饱和指数', value: 2.3, center: ['37.5%', '50%'] },
            { name: '失衡指数', value: 4.5, center: ['62.5%', '50%'] },
            { name: '空放指数', value: 4.2, center: ['87.5%', '50%'] },
        ];

        const trafficMonitorPieChart = echarts.init(document.getElementById('traffic-monitor-piechart'));

        const symbolOptions = {
            series: chartData.map(item => ({
                type: 'gauge',
                startAngle: 360,
                endAngle: 0,
                min: 0,
                max: 5,
                splitNumber: 2,
                // item style here
                itemStyle: {
                    color: '#0b5df1',
                    shadowColor: 'rgba(0,138,255,0.45)',
                    shadowBlur: 8,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
                progress: {
                    show: true,
                    roundCap: true,
                    width: 10
                },
                pointer: {
                    show: false,
                    icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
                    length: '55%',
                    width: 3,
                    offsetCenter: [0, '-25%']
                },
                axisLine: { show: true, lineStyle: { color: [[1, 'rgba(5, 17, 78, 0.3)']] }, width: 10 },
                axisTick: { show: false },
                splitLine: {
                    show: false,
                    length: 3,
                    lineStyle: {
                        width: 2,
                        color: '#fff'
                    }
                },
                center: item.center,
                detail: {
                    formatter: '{value}',
                    width: '50%',
                    offsetCenter: [0, '5%'],
                    valueAnimation: true,
                    textStyle: {
                        fontSize: 20,
                        color: '#ccc',
                    },
                },
                data: [{ value: item.value, name: item.name }],
                title: { fontSize: 14, offsetCenter: [0, '150%'], color: '#fff', bcakgroundColor: 'rgba(23, 44, 94, 0.5)' },
                name: item.name,
                radius: '40%', // Adjust as per your requirements
            })),
        };

        trafficMonitorPieChart.setOption(symbolOptions);

        // Initialize the line chart
        const trafficFlowLineChart = echarts.init(document.getElementById('traffic-flow-linechart'));
        console.log('rendering');
        const lineGraphOption = {
            title: {
                text: '交通流量（辆）',
                textStyle: { color: '#FFF', fontSize: 13, fontWeight: 'normal' }
            },
            xAxis: {
                type: 'category',
                data: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',],
                axisLine: { lineStyle: { color: '#ccc' } },
                splitNumber: 4,
                splitLine: {
                    lineStyle: {
                        color: '#ccc'  // Color of the horizontal grid lines
                    }
                },
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#ccc' } },
                axisTick: {
                    show: true,
                    length: 5,
                },
                splitNumber: 4,
                splitLine: {
                    lineStyle: {
                        color: '#777'  // Color of the horizontal grid lines
                    }
                },
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            series: [
                {
                    data: randomCurrent,
                    type: 'line',
                    showSymbol: false,
                    smooth: true,
                    color: '#3ae7e6'
                },
                {
                    data: randomToday,
                    type: 'line',
                    smooth: true,
                    color: '#2158ba',
                    showSymbol: false,
                }]
        };
        trafficFlowLineChart.setOption(lineGraphOption);
    }, [randomCurrent, randomToday]);

    // active button 
    const [activeIndex, setActiveIndex] = useState(null);
    const buttons = ['东进口', '西进口', '南进口', '北进口'];
    const handleButtonClick = (index) => {
        setActiveIndex(index);

        // Generate and set the random arrays
        setRandomCurrent(generateRandomArray(12, 0, 300));
        setRandomToday(generateRandomArray(12, 0, 250));
    };
    return (
        <section className="junction-leftTop">
            <div className="traffic-flow-container">
                <div className="title"><span className='svg'><NavIcon /></span><span>实时态势监控</span></div>
                <div className="slider-container">
                    <h1 className="slider-label"><span><TriangleIcon /></span>拥堵指数</h1>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        defaultValue="7"
                        className="custom-range"
                    />
                    <div className="slider-values">
                        <span>1</span>
                        <span>1.4</span>
                        <span>1.8</span>
                        <span>2.2</span>
                        <span></span>
                    </div>
                    <div className="slider-describe">
                        <span>畅通</span>
                        <span>轻度拥堵</span>
                        <span>中度拥堵</span>
                        <span>严重拥堵</span>
                        <span></span>
                    </div>
                </div>
                <div className="slider-trafficFlow">
                    <h1 className="slider-label"><span><TriangleIcon /></span>过车流量</h1>
                    <div className="content-container">
                        <span className="text"><span><CarIcon /></span>机动车过车总量</span>
                        <span className="number">1635<span className="unit">辆</span></span>
                    </div>
                </div>
            </div>
            <div className="pie-container">
                <div className="title"><span className='svg'><NavIcon /></span><span>实时态势监控</span></div>
                <div id="traffic-monitor-piechart" style={{ width: '400px', height: '200px' }}></div>
            </div>
            <div className="line-container">
                <div className="title"><span className='svg'><NavIcon /></span><span>实时态势监控</span></div>
                <div className="control-buttons">
                    <ButtonGroup size="lg" className="mb-2">
                        {buttons.map((label, index) => (
                            <Button
                                key={index}
                                className={activeIndex === index ? 'active-btn' : ''}
                                onClick={() => handleButtonClick(index)}
                            >
                                {label}
                            </Button>
                        ))}
                    </ButtonGroup>
                </div>
                <div id="traffic-flow-linechart" ></div>
            </div>

        </section >

    )
}