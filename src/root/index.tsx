
import { Pie, Gauge, GaugeConfig, PieConfig } from "@ant-design/charts";
import { MassMarks } from "@uiw/react-amap";
import { Button, Card, Col, Descriptions, Divider, Row, Spin, Table, Tabs } from "antd";
import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getTerminals, NodeInfo, runInfo, runingState } from "../common/FecthRoot";
import { Amap_gps2AutonaviPosition, stringToLngLat, V2_API_Aamp_ip2local } from "../common/Fetch";
import { AmapLoader } from "../components/amaploader";
import { RootMain } from "../components/RootMain";

const ob: Record<string, string> = {
    'all': '全部',
    'online': '在线'
}

interface terJw {
    position?: AMap.LngLat
    name: string;
    jw?: string
    ip: string;
    mac: string;
    online: boolean

}

export const RootIndex: React.FC = () => {
    /**
     * 饼图通用配置
     */
    const pieConfig: Omit<PieConfig, 'data'> = {
        angleField: "value",
        colorField: "type",
        radius: 0.4,
        label: {
            type: 'spider',
            labelHeight: 28,
            content: '{name}:{value}\n{percentage}',
        },
        renderer: "svg",
        supportCSSTransform: true
    }

    const guageConfig = (title: string): Partial<GaugeConfig> => {
        return {
            radius: .8,
            range: {
                color: '#30BF78',
                width: 12
            },
            gaugeStyle: {
                lineCap: "round"
            },
            statistic: {
                title: {
                    formatter: () => title
                },
                content: {
                    formatter: (data) => `${(data!.percent * 100).toFixed(1)}%`,
                    style: {
                        fontSize: "45"
                    }
                }
            },
            renderer: "svg"
        }
    }

    const [marks, setMarks] = useState<AMap.MassMarkersDataOptions>([])

    const marker = useRef<AMap.Marker>()

    const [nodeInfo, setNodeInfo] = useState<Uart.nodeInfo[]>([])

    const [runInfo, setRunInfo] = useState<runInfo>()

    /**
     * 更新海量点数据
     * @param ters 
     */
    const updateMarks = (ters: Uart.Terminal[]) => {
        if (window.AMap) {
            const terminals = ters
                .filter(el => el.ip)
                .map(el => ({ name: el.name, jw: el.jw, ip: el.ip!, mac: el.DevMac, online: el.online || false }))
                .map<Promise<terJw>>(el => {
                    const lnglat = localStorage.getItem(el.mac + 'lnglat')
                    if (lnglat) {
                        return new Promise(res => {
                            res({ ...el, position: JSON.parse(lnglat) })
                        })
                    } else {
                        if (el.jw) {
                            return Amap_gps2AutonaviPosition(el.jw as string, window)
                                .then(data => ({ ...el, position: data }))
                        } else {
                            return V2_API_Aamp_ip2local(el.ip!)
                                .then(data => {
                                    const position = data.data ? stringToLngLat(data.data) : undefined
                                    return ({ ...el, position })
                                })
                                .catch(() => ({ ...el }))
                        }
                    }

                })

            Promise.all(terminals)
                .then(el => {
                    el.forEach(jw => {
                        jw.position = jw.position || stringToLngLat("113.9491806,29.9532222")
                        if (!localStorage.getItem(jw.mac + 'lnglat')) {
                            localStorage.setItem(jw.mac + 'lnglat', JSON.stringify([jw.position!.getLng(), jw.position.getLat()]))
                        }
                    })
                    const jws = el//.filter(p => p.position)
                    setMarks(jws.map(jw => ({ name: jw.name, lnglat: jw.position!, style: 0, mac: jw.mac })))


                })
        }
    }

    /**
     * 当鼠标移动到标记点,显示标记点名称
     * @param evn 
     */
    const mouse = (evn: any) => {
        if (!marker.current) {
            marker.current = new window.AMap.Marker<any>({ content: '', map: evn.target.getMap() })
        }
        marker.current.setPosition(evn.data.lnglat);
        marker.current.setLabel({ content: evn.data.name })

    }

    /**
     * 获取服务器运行状态
     */
    const getRunInfo = async () => {
        runingState()
            .then(el => setRunInfo(el.data))
        NodeInfo()
            .then(el => setNodeInfo(el.data))
        getTerminals()
            .then(el => updateMarks(el.data))
    }

    /**
     * 定时更新服务器数据
     */
    useEffect(() => {
        getRunInfo()
        const i = setInterval(() => {
            getRunInfo()
        }, 30000)
        return () => clearInterval(i!)
    }, [])

    /**
     * 格式化系统信息
     */
    const parseRunInfo = useMemo(() => {
        if (runInfo) {
            const data = runInfo
            return {
                user: Object.entries(data.User).map(([type, value]) => ({ type: ob[type] + '用户', value: Number(value) })),
                node: Object.entries(data.Node).map(([type, value]) => ({ type: ob[type] + '节点', value: Number(value) })),
                ter: Object.entries(data.Terminal).map(([type, value]) => ({ type: ob[type] + '终端', value: Number(value) })),
                sys: data.SysInfo,
                protocol: data.Protocol,
                events: data.events,
                timeOut: data.TimeOutMonutDev,
                nodes: data.Node.all,
                terminals: data.Terminal.all,
                users: data.User.all
            };
        }
    }, [runInfo])

    return (
        <RootMain>
            <Tabs>
                <Tabs.TabPane key="main" tab="Server运行状态">
                    {
                        !parseRunInfo ? <Spin />
                            :
                            <section>
                                <Divider orientation="center">在线状态</Divider>
                                <Descriptions>
                                    <Descriptions.Item label="用户数">{parseRunInfo.users}</Descriptions.Item>
                                    <Descriptions.Item label="节点数">{parseRunInfo.nodes}</Descriptions.Item>
                                    <Descriptions.Item label="终端数">{parseRunInfo.terminals}</Descriptions.Item>
                                    <Descriptions.Item label="协议数">{parseRunInfo.protocol}</Descriptions.Item>
                                    <Descriptions.Item label="超时设备数">{parseRunInfo.timeOut}</Descriptions.Item>
                                    <Descriptions.Item label="事件数">{parseRunInfo.events}</Descriptions.Item>
                                </Descriptions>
                                <Row gutter={30}>
                                    {
                                        (['user', 'node', 'ter'] as ('user')[]).map(el =>
                                            <Col key={el} span={24} md={8} >
                                                <Pie data={parseRunInfo[el]} {...pieConfig}></Pie>
                                            </Col>
                                        )
                                    }
                                </Row>
                                <Divider orientation="center">服务器信息</Divider>
                                <Descriptions>
                                    <Descriptions.Item label="服务器名称">{parseRunInfo.sys.hostname}</Descriptions.Item>
                                    <Descriptions.Item label="开机时间">{parseRunInfo.sys.uptime}</Descriptions.Item>
                                    <Descriptions.Item label="总内存">{parseRunInfo.sys.totalmem}</Descriptions.Item>
                                    <Descriptions.Item label="使用内存">{parseRunInfo.sys.usemen}%</Descriptions.Item>
                                    <Descriptions.Item label="使用cpu">{parseRunInfo.sys.usecpu}</Descriptions.Item>
                                    <Descriptions.Item label="loadavg">{parseRunInfo.sys.loadavg.join(" | ")}</Descriptions.Item>
                                    <Descriptions.Item label="系统版本">{parseRunInfo.sys.version}</Descriptions.Item>
                                </Descriptions>
                                <Row gutter={28}>
                                    <Col span={12}>
                                        <Card>
                                            <Gauge percent={parseRunInfo.sys.usecpu / 100} {...guageConfig("cpu性能")}></Gauge>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card>
                                            <Gauge percent={parseRunInfo.sys.usemen / 100} {...guageConfig("men性能")}></Gauge>
                                        </Card>
                                    </Col>
                                </Row>
                                <Row gutter={28}>
                                    <Divider orientation="center">节点信息</Divider>
                                    <Col span={24}>
                                        <Table dataSource={nodeInfo.map(el => ({ ...el, key: (el as any)._id }))} pagination={false}>
                                            <Table.Column dataIndex="NodeName" title="节点名称"></Table.Column>
                                            <Table.Column dataIndex="totalmem" title="总内存"></Table.Column>
                                            <Table.Column dataIndex="freemem" title="空闲内存"></Table.Column>
                                            <Table.Column dataIndex="loadavg" title="loadavg" render={(val: number[]) => val.join(' | ')}></Table.Column>
                                            <Table.Column dataIndex="uptime" title="运行时间"></Table.Column>
                                            <Table.Column dataIndex="Connections" title="连接数"></Table.Column>
                                            <Table.Column dataIndex="updateTime" title="更新时间" render={val => moment(val).format("YY-M-D H:m:s")}></Table.Column>
                                            <Table.Column title="操作" key="oprate" render={(value, record: Uart.nodeInfo) =>
                                                <Button type="primary" size="small" onClick={() => { }}>修改</Button>
                                            }></Table.Column>
                                        </Table>
                                    </Col>
                                </Row>
                            </section>
                    }
                </Tabs.TabPane>
                <Tabs.TabPane key="map" tab="终端地图">
                    <AmapLoader zoom={5} height={800} onComplete={() => getRunInfo()}>
                        <MassMarks data={marks} onMouseOver={mouse} onClick={undefined} onDblClick={undefined} onMouseDown={undefined} onMouseUp={undefined} onMouseOut={undefined} onTouchStart={undefined} onTouchEnd={undefined}></MassMarks>
                    </AmapLoader>
                </Tabs.TabPane>
            </Tabs>
        </RootMain>
    )
}