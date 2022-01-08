import { Pie } from "@ant-design/charts";
import { Button, Col, Divider, Form, Input, message, Modal, Row, Space, Tag } from "antd";
import React, { useMemo, useState } from "react";
import { pieConfig, pieData } from "../../common/charts";
import { addRegisterTerminal, UpdateIccids } from "../../common/FecthRoot";
import { ModalConfirm } from "../../common/util";
import { NodesSelects } from "../../components/Selects";
import { TerminalsTable } from "../../components/terminalsTable";
import { useNav } from "../../hook/useNav";


export const TerminalAddDTU: React.FC = () => {

    const [mac, setMac] = useState<string>('')

    const [node, setNode] = useState('')

    const macs = useMemo(() => {
        return mac.split(",")
    }, [mac])


    /**
     * 批量添加设备
     */
    const addRegisterTerminals = async () => {
        for (const mac of macs) {
            if (mac.length !== 12) {
                const ok = await ModalConfirm(`[${mac}]长度为${mac.length},标准长度为12位,确认提交??`)
                if (!ok) continue
                await addRegisterTerminal(mac, node)
                message.success(`添加设备${mac}成功`)
            }
        }

    }


    return (
        <>
            <Divider>批量添加设备</Divider>
            <Form>
                <Form.Item label="设备ID">
                    <Input placeholder="多个设备以(,)逗号分隔" onChange={e => setMac(e.target.value)}></Input>
                </Form.Item>
                <Form.Item label={"已选择ID / " + macs.length}>
                    <>
                        {
                            macs.map(el => <Tag>{el}</Tag>)
                        }
                    </>
                </Form.Item>
                <Form.Item label="注册节点">
                    <NodesSelects onChange={val => setNode(val.value as string)}></NodesSelects>
                </Form.Item>
                <Form.Item>
                    <Button onClick={() => addRegisterTerminals()}>提交</Button>
                </Form.Item>
            </Form>
        </>
    )
}


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

    return (
        <>
            <Divider orientation="left">所有挂载设备,总数{terminals.length}</Divider>
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
        </>
    )
}