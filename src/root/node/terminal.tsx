import { Pie } from "@ant-design/charts";
import { MoreOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Dropdown, Menu, message, Modal, Row, Space, Switch, Table, Tabs, Tag, Tooltip } from "antd";
import { ColumnsType } from "antd/lib/table";
import moment from "moment";
import React, { useCallback, useMemo, useState } from "react";
import { pieConfig, pieData } from "../../common/charts";
import { IotRecharge, IotUpdateAutoRechargeSwitch, UpdateIccids } from "../../common/FecthRoot";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { DevPosition } from "../../components/devPosition";
import { IconFont } from "../../components/IconFont";
import { MyCopy } from "../../components/myCopy";
import { TerminalInfo, TerminalMountDevs, TerminalsTable } from "../../components/terminalsTable";
import { useNav } from "../../hook/useNav";

/**
 * 显示所有设备
 * @returns 
 */
export const Terminals: React.FC = () => {

    const nav = useNav()

    const [terminals, setterminals] = useState<Uart.Terminal[]>([])

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

    const terminal_4G = useCallback(() => {
        const now = new Date()
        const result = terminals.filter(el => {
            const has = el.iccidInfo && el.iccidInfo.expireDate
            const time = moment(el?.iccidInfo?.expireDate)
            return has && (el!.iccidInfo!.restOfFlow < 30 * 1024 || (time.diff(now, 'day') < 5 && time.diff(now, 'day') > -15 ))
        })
        return result
    }, [terminals])

    /**
     * 更新所有iccid
     */
    const updateICCIDs = async () => {
        Modal.confirm({
            title: "更新ICCID",
            content: '确认需要更新所有4G模块的物联卡信息吗?频繁操作将导致api锁死',
            onOk() {
                message.loading({ content: 'loading', key: 'updateICCIDs' })
                UpdateIccids().then(el => {
                    message.success({ content: `已更新完成,耗时${el.data.time},更新${el.data.length}条`, key: 'updateICCIDs' })
                })
            }
        })
    }

    /**
     * 
     * @param mac 
     */
    const UpdateAutoRechargeSwitch = async (iccid: string, open:boolean) => {
        IotUpdateAutoRechargeSwitch(iccid, open).then(el => {
            message.info(el.code ? 'success' : el.msg)
        })
    }

    return (
        <Tabs defaultActiveKey="1">
            <Tabs.TabPane tabKey="all" tab={"所有挂载设备,总数" + terminals.length} key="1">
                <Space>
                    <Button onClick={() => updateICCIDs()}>更新ICCID</Button>
                    <Button onClick={() => nav('/root/node/Terminal/RegisterTerminal')}>批量注册设备</Button>
                </Space>
                <Row gutter={36}>
                    <Col span={12} key="onlines">
                        <Pie
                            data={status.onlines}
                            {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5, })}
                        > </Pie>
                    </Col>
                    <Col span={12} key="nodes">
                        <Pie
                            data={status.nodes}
                            {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5, })}
                        > </Pie>
                    </Col>
                    <Col span={12} key="pids">
                        <Pie
                            data={status.pids}
                            {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5, })}
                        > </Pie>
                    </Col>
                    <Col span={12} key="devs">
                        <Pie
                            data={status.devs}
                            {...pieConfig({ angleField: 'value', colorField: 'type', radius: .5, })}
                        > </Pie>
                    </Col>
                </Row>
                <TerminalsTable
                    readyData={setterminals}
                ></TerminalsTable>
            </Tabs.TabPane>
            <Tabs.TabPane tab="4G-即将失效" tabKey="iccid" key="2">
                <Table
                    dataSource={generateTableKey(terminal_4G(), "DevMac")}
                    size="small"
                    scroll={{ x: 1000 }}
                    pagination={{ pageSize: 100 }}
                    columns={[
                        {
                            dataIndex: 'online',
                            title: '状态',
                            width: 70,
                            filters: [
                                {
                                    text: '在线',
                                    value: true
                                },
                                {
                                    text: '离线',
                                    value: false
                                }
                            ],
                            onFilter: (val, re) => re.online === val,
                            defaultSortOrder: "descend",
                            sorter: (a: any, b: any) => a.online - b.online,
                            render: (val) => <Tooltip title={val ? '在线' : '离线'}>
                                <IconFont
                                    type={val ? 'icon-zaixianditu' : 'icon-lixian'}
                                    style={{ fontSize: 22 }}
                                />
                            </Tooltip>
                        },
                        {
                            dataIndex: 'iccidInfo',
                            title: '自动续订',
                            width: 70,
                            onFilter: (val, re) => re.online === val,
                            sorter: (a: any, b: any) => a.online - b.online,
                            render: (iccidInfo: Uart.iccidInfo, ter: Uart.Terminal) =><Switch defaultChecked={iccidInfo.IsAutoRecharge} onChange={b=>UpdateAutoRechargeSwitch(ter.ICCID!,b)}></Switch>
                        },
                        {
                            dataIndex: 'name',
                            title: '名称',
                            ellipsis: true,
                            width: 180,
                            ...getColumnSearchProp<Uart.Terminal>('name')
                        },
                        {
                            dataIndex: 'ICCID',
                            title: 'ICCID',
                            ellipsis: true,
                            width: 120,
                            ...getColumnSearchProp<Uart.Terminal>("ICCID"),
                            render: val => val && <MyCopy value={val}></MyCopy>
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
                            dataIndex: 'iccidInfo',
                            title: '接口版本',
                            width: 165,
                            
                            render: (iccidInfo: Uart.iccidInfo) => iccidInfo.version
                        },
                        {
                            dataIndex: 'iccidInfo',
                            title: '套餐流量',
                            width: 165,
                            render: (iccidInfo: Uart.iccidInfo) => (iccidInfo.flowResource / 1024).toFixed(0) + 'MB'
                        },
                        {
                            dataIndex: 'iccidInfo',
                            title: '剩余流量',
                            width: 165,
                            render: (iccidInfo: Uart.iccidInfo) => (iccidInfo.restOfFlow / 1024).toFixed(0) + 'MB',
                            sorter: {
                                compare: (a: Uart.iccidInfo, b: Uart.iccidInfo) => a.restOfFlow - b.restOfFlow
                            }
                        },
                        {
                            dataIndex: 'iccidInfo',
                            title: '剩余流量比例',
                            width: 120,
                            render: (iccidInfo: Uart.iccidInfo) => ((iccidInfo.restOfFlow *100) / iccidInfo.flowResource).toFixed(1) + '%'
                        },
                        {
                            dataIndex: 'iccidInfo',
                            title: '剩余天数',
                            width: 120,
                            render: (iccidInfo: Uart.iccidInfo) => moment(iccidInfo.expireDate).diff(new Date(), 'day') + 'day',
                            sorter: {
                                compare: (a: Uart.iccidInfo, b: Uart.iccidInfo) => new Date(a.expireDate).getDate() - new Date(b.expireDate).getDate()
                            }
                        },

                        {
                            key: 'oprate',
                            title: '操作',
                            width: 120,
                            render: (_, t) => <Space size={0} wrap>
                                <Button type="link" onClick={() => nav('/root/node/Terminal/info?mac=' + t.DevMac)}>查看</Button>
                            </Space>
                        }
                    ] as ColumnsType<Uart.Terminal>}

                    expandable={{
                        expandedRowRender: (re, _, __, ex) => <>
                            <TerminalInfo terminal={re} ex={ex} />
                            <TerminalMountDevs terminal={re} ex={ex} showTitle={false} InterValShow></TerminalMountDevs>
                            <DevPosition terminal={re} />
                        </>,
                        fixed: "left"
                    }}
                >
                </Table>
            </Tabs.TabPane>
        </Tabs>
    )
}

export default Terminals