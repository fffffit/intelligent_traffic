import React from 'react';

import './index.scss';

export default function TrafficFlow() {
    const flowInfo = [
        {
            title: '路口运行信息',
            number: 23.5,
            unit: '辆'
        },
        {
            title: '今日公交客流量',
            number: 23.5,
            unit: '万人次'
        },
        {
            title: '今日公共自行车使用量',
            number: 23.5,
            unit: '万次'
        },
        {
            title: '今日停车总量',
            number: 23,
            unit: '万车次'
        }
    ]
    const trafficFlow = flowInfo.map((item, index) => {
        return (
            <div className="container" key={index}>
                <div className="title">{item.title}</div>
                <span className="number">{item.number}<span className="unit">{item.unit}</span></span>
            </div>
        )
    })

    return (
        <section className="trafficFlow">
            {trafficFlow}
        </section>
    )
}
