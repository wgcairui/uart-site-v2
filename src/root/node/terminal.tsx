import { Pie } from "@ant-design/charts";
import { CheckCircleFilled, WarningFilled, EyeFilled, DeleteFilled } from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Divider, message, Popconfirm, Row, Space, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { pieConfig, pieData } from "../../common/charts";
import { getTerminals } from "../../common/FecthRoot";
import { getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { DevCard } from "../../components/devCard";
import { devTypeIcon, IconFont } from "../../components/IconFont";
import { MyInput } from "../../components/myInput";
import { RootMain } from "../../components/RootMain";



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
            onlines: [{ type: '在线', value: on }, { type: '离线', value: terminals.length - on }],
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
            <Table dataSource={terminals} size="small"
                columns={[
                    {
                        dataIndex: 'online',
                        title: '状态',
                        width: 50,
                        render: (val) => <Tooltip title={val ? '在线' : '离线'}>
                            <IconFont
                                type={val ? 'icon-zaixianditu' : 'icon-lixian'}
                                style={{ fontSize: 22 }}
                            />
                        </Tooltip>
                    },
                    {
                        dataIndex: 'name',
                        title: '名称',
                        ellipsis: true,
                        ...getColumnSearchProp<Uart.Terminal>('name')
                    },
                    {
                        dataIndex: 'DevMac',
                        title: 'mac',
                        width: 140,
                        ...getColumnSearchProp<Uart.Terminal>('DevMac')
                    },
                    {
                        dataIndex: 'user',
                        title: '用户',
                        width: 140,
                        ellipsis: true,
                        ...getColumnSearchProp<any>('user')
                    },
                    {
                        dataIndex: 'ICCID',
                        title: 'ICCID',
                        ellipsis: true,
                        width: 120,
                        ...getColumnSearchProp<Uart.Terminal>("ICCID")
                    },
                    {
                        dataIndex: 'mountNode',
                        title: '节点',
                        width: 80,
                        ...tableColumnsFilter(terminals, 'mountNode')
                    },
                    {
                        dataIndex: 'uptime',
                        title: '更新时间',
                        width: 165,
                        render: val => moment(val || "1970-01-01").format("YYYY-MM-DD H:m:s"),
                        sorter: {
                            compare: (a: any, b: any) => new Date(a.uptime).getDate() - new Date(b.uptime).getDate()
                        }
                    },
                    {
                        key: 'oprate',
                        fixed: 'right',
                        render(_, recrod) {
                            return <>
                                <Button type="link">重命名</Button>
                                <Button type="link">备注</Button>
                            </>
                        }
                    }
                ]}

                expandable={{
                    expandedRowRender: (terminal: Uart.Terminal & { user?: string }) =>
                        <Card>
                            <Descriptions title={terminal.name}>
                                <Descriptions.Item label="mac">
                                    <MyInput value={terminal.DevMac} onSave={val => terminal.DevMac = val}></MyInput>
                                </Descriptions.Item>
                                <Descriptions.Item label="用户">{terminal.user}</Descriptions.Item>
                                <Descriptions.Item label="别名">{terminal.name}</Descriptions.Item>
                                <Descriptions.Item label="AT支持">
                                    <Tag color="cyan">{terminal.AT ? '支持' : '不支持'}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="ICCID">{terminal.ICCID}</Descriptions.Item>
                                <Descriptions.Item label="PID">{terminal.PID}</Descriptions.Item>
                                <Descriptions.Item label="设备IP">{terminal.ip}</Descriptions.Item>
                                <Descriptions.Item label="设备定位">{terminal.jw}</Descriptions.Item>
                                <Descriptions.Item label="挂载节点">{terminal.mountNode}</Descriptions.Item>
                                <Descriptions.Item label="TCP端口">{terminal.port}</Descriptions.Item>
                                <Descriptions.Item label="串口参数">{terminal.uart}</Descriptions.Item>
                                <Descriptions.Item label="iot">{terminal.iotStat}</Descriptions.Item>
                                <Descriptions.Item label="Gver">{terminal.Gver}</Descriptions.Item>
                                <Descriptions.Item label="ver">{terminal.ver}</Descriptions.Item>
                                <Descriptions.Item label="更新时间">{moment(terminal.uptime).format('YYYY-MM-DD H:m:s')}</Descriptions.Item>
                                <Descriptions.Item label="备注">
                                    <MyInput
                                        value={terminal.remark}
                                        textArea
                                    ></MyInput>
                                </Descriptions.Item>
                            </Descriptions>
                            {
                                terminal.iccidInfo &&
                                <>
                                    <Divider orientation="left">SIM卡</Divider>
                                    <Descriptions>
                                        <Descriptions.Item label="起始时间">{terminal.iccidInfo.validDate}</Descriptions.Item>
                                        <Descriptions.Item label="终止时间">{terminal.iccidInfo.expireDate}</Descriptions.Item>
                                        <Descriptions.Item label="套餐名称">{terminal.iccidInfo.resName}</Descriptions.Item>
                                        <Descriptions.Item label="全部流量">{terminal.iccidInfo.flowResource / 1024}MB</Descriptions.Item>
                                        <Descriptions.Item label="使用流量" >{(terminal.iccidInfo.flowUsed / 1024).toFixed(0)}MB</Descriptions.Item>
                                        <Descriptions.Item label="使用比例" >{((terminal.iccidInfo.flowUsed / terminal.iccidInfo.flowResource) * 100).toFixed(0)}%</Descriptions.Item>
                                    </Descriptions>
                                </>
                            }
                            <Divider orientation="left">挂载设备</Divider>
                            <Row>
                                {
                                    terminal?.mountDevs && terminal.mountDevs.map(el =>
                                        <Col span={4} key={terminal.DevMac + el.pid}>
                                            <DevCard
                                                img={`http://admin.ladishb.com/upload/${el.Type}.png`}
                                                title={<Space>
                                                    <Tooltip title={el.online ? '在线' : '离线'}>
                                                        {el.online ? <CheckCircleFilled style={{ color: "#67C23A" }} /> : <WarningFilled style={{ color: "#E6A23C" }} />}
                                                    </Tooltip>
                                                    {el.mountDev}
                                                </Space>}
                                                avatar={devTypeIcon[el.Type]}
                                                subtitle={terminal.DevMac + '-' + el.pid}
                                                actions={[
                                                    <Tooltip title="编辑查看">
                                                        <EyeFilled style={{ color: "#67C23B" }} onClick={() => nav("/dev/" + terminal.DevMac + el.pid)} />
                                                    </Tooltip>,

                                                    <Tooltip title="删除" >
                                                        <Popconfirm
                                                            title={`确认删除设备[${el.mountDev}]?`}
                                                            onConfirm={() => delMountDev(el)}
                                                            onCancel={() => message.info('cancel')}
                                                        >
                                                            <DeleteFilled style={{ color: "#E6A23B" }} />
                                                        </Popconfirm>
                                                    </Tooltip>
                                                ]}></DevCard>
                                        </Col>
                                    )
                                }
                            </Row>

                        </Card>
                }}
            >
            </Table>
        </RootMain>
    )
}