import { Pie } from "@ant-design/charts";
import { Col, Divider, Row } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { pieConfig, pieData } from "../../common/charts";
import { getTerminals } from "../../common/FecthRoot";
import { RootMain } from "../../components/RootMain";
import { TerminalsTable } from "../../components/terminalsTable";

export const Terminals: React.FC = () => {

    const [terminals, setTerminals] = useState<Uart.Terminal[]>([])


    const upTerminals = () => {
        getTerminals()
            .then(({ data }) => setTerminals(data.map(el => ({ ...el, key: el.DevMac }))))
    }

    useEffect(() => {
        upTerminals()
    }, [])

    const status = useMemo(() => {
        // 在线
        let on = 0

        // 节点分布
        const nodes = new Map<string, number>()

        // 型号
        const models = new Map<string, number>()

        // 设备分布
        const devs = new Map<string, number>()

        terminals.forEach(el => {
            el.online && on++;

            {
                nodes.set(el.mountNode, (nodes.get(el.mountNode) || 0) + 1)
            }
            {
                const pid = el.PID || 'univer'
                models.set(pid, (models.get(pid) || 0) + 1)
            }
            {
                if (el.mountDevs && el.mountDevs.length > 0) {
                    el.mountDevs.forEach(dev => {
                        const key = dev.Type + '-' + dev.mountDev
                        devs.set(key, (devs.get(key) || 0) + 1)
                    })
                }
            }
        })

        return {
            onlines: [{ type: '离线', value: terminals.length - on }, { type: '在线', value: on },],
            nodes: [...nodes.entries()].map(([type, value]) => ({ type, value })),
            pids: [...models.entries()].map(([type, value]) => ({ type, value })),
            devs: [...devs.entries()].map(([type, value]) => ({ type, value }))
        } as Record<string, pieData[]>

    }, [terminals])
    return (
        <RootMain>
            <Divider orientation="left">所有挂载设备,总数{terminals.length}</Divider>
            <Row gutter={36}>
                <Col span={12} key="onlines">
                    <Pie data={status.onlines} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5 })}> </Pie>
                </Col>
                <Col span={12} key="nodes">
                    <Pie data={status.nodes} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5 })}> </Pie>
                </Col>
                <Col span={12} key="pids">
                    <Pie data={status.pids} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5 })}> </Pie>
                </Col>
                <Col span={12} key="devs">
                    <Pie data={status.devs} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5 })}> </Pie>
                </Col>
            </Row>
            <TerminalsTable dataSource={terminals}></TerminalsTable>
        </RootMain>
    )
}