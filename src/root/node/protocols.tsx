import { Button, Card, Collapse, Divider, Dropdown, Form, Input, Menu, message, Modal, Radio, Space, Table } from "antd";
import React, { useMemo, useState } from "react";
import { deleteProtocol, getProtocols, setProtocol } from "../../common/FecthRoot";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter, tableConfig } from "../../common/tableCommon";
import { pieConfig } from "../../common/charts";
import { Pie } from "@ant-design/charts";
import { usePromise } from "../../hook/usePromise";
import { ColumnsType } from "antd/lib/table";
import { useNav } from "../../hook/useNav";
import { MoreOutlined } from "@ant-design/icons";
import { MyCopy } from "../../components/myCopy";
import { downJson } from "../../common/util";
import { getProtocol } from "../../common/Fetch";

interface props {
    ok?: (protocol: string) => void
}

const AddProtocol: React.FC<props> = ({ ok }) => {

    const types = [
        { value: 'ups', label: "UPS" },
        { value: 'air', label: "空调" },
        { value: 'em', label: "电量仪" },
        { value: 'th', label: "温湿度" },
        { value: 'io', label: "IO" },
    ]

    const [Type, setType] = useState<Uart.communicationType>(485)

    const [protocolType, setProtocolType] = useState<Uart.protocolType>("air")

    const [name, setName] = useState("")

    /**
     * 添加协议
     * @returns 
     */
    const add = async () => {
        const { data } = await getProtocol(name)
        if (data) {
            message.warning("协议名称重复")
            return
        }
        message.loading({ content: '添加协议', key: name })
        setProtocol(Type, protocolType, name, [])
            .then(el => {
                if (el.code) {
                    message.success({ content: '添加协议成功', key: name })
                    ok && ok(name)
                } else {
                    message.warn(el.message)
                }
            })
    }

    return (

        <Form>
            <Form.Item label="协议名称">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="输入协议名称"></Input>
            </Form.Item>
            <Form.Item label="协议类型">
                <Radio.Group onChange={e => setType(e.target.value)} value={Type}>
                    {
                        [485, 232].map(el => <Radio value={el} key={el}>{el}</Radio>)
                    }
                </Radio.Group>
            </Form.Item>
            <Form.Item label="设备类型">
                <Radio.Group onChange={e => setProtocolType(e.target.value)} value={protocolType}>
                    {
                        types.map(el => <Radio value={el.value} key={el.label}>{el.label}</Radio>)
                    }
                </Radio.Group>
            </Form.Item>
            <Form.Item >
                <Button type="primary" onClick={() => add()} disabled={!name}>添加</Button>
            </Form.Item>
        </Form>

    )
}


export const Protocols: React.FC = () => {

    const nav = useNav()

    const [fProtocolType, setProtocolType] = useState<string[]>([])

    const { data, loading, fecth } = usePromise(async () => {
        const el = await getProtocols();
        return el.data
    }, [])

    const status = useMemo(() => {
        const m = new Map<string, number>()
        data.forEach(el => {
            m.set(el.ProtocolType, (m.get(el.ProtocolType) || 0) + 1)
        })
        return [...m.entries()].map(([type, value]) => ({ type, value }))
    }, [data])

    /**
     * 删除协议
     * @param Protocol 
     */
    const deleteProtocols = async (Protocol: string) => {
        Modal.confirm({
            content: `确定要删除指令:${Protocol}吗??`,
            onOk() {
                deleteProtocol(Protocol).then(el => {
                    if (el.code === 0) {
                        Modal.error({ content: `${el.data} 还在使用协议!!!` })
                    } else {
                        message.success("删除协议success")
                        fecth()
                    }
                })
            }
        })
    }

    /**
     * 下载协议
     */
    const downProtocol = async (protocol?: string) => {
        const list = protocol ? [protocol] : []
        const protocols = protocol ? data.filter(el => el.Protocol === protocol) : data
        downJson(JSON.stringify(protocols), `${protocol || '所有协议'}.json`)
    }

    return (
        <>
            <Divider orientation="left">所有协议 / {data.length}</Divider>
            <Pie data={status}
                {...pieConfig({ angleField: 'value', colorField: 'type', radius: .8, onClick: t => setProtocolType([t]) })}
            />
            <Collapse ghost>
                <Collapse.Panel header="添加协议" key="1">
                    <Card>
                        <AddProtocol ok={(p) => {
                            fecth()
                            nav('/root/node/Protocols/info', { Protocol: p })
                        }}></AddProtocol>
                    </Card>
                </Collapse.Panel>
            </Collapse>
            <Divider></Divider>
            <Table
                loading={loading}
                dataSource={generateTableKey(data, '_id')}
                {...tableConfig}
                pagination={false}
                scroll={{x:1000}}
                columns={[

                    {
                        dataIndex: 'Protocol',
                        title: "协议",
                        ...getColumnSearchProp("Protocol"),
                        width:220
                    },
                    {
                        dataIndex: 'ProtocolType',
                        title: "协议类型",
                        ...tableColumnsFilter(data, 'ProtocolType'),
                        width:120
                    },
                    {
                        dataIndex: "Type",
                        title: "串口类型",
                        width:120
                        
                    },
                    {
                        dataIndex: "remark",
                        title: '备注',
                        ellipsis: true,
                        ...getColumnSearchProp("remark"),
                        render: val => <MyCopy value={val}></MyCopy>
                    },
                    {
                        key: "oprate",
                        title: "操作",
                        width: 110,
                        render: (_, re) => <Space size={0} wrap>
                            <Button type="link" onClick={() => nav('/root/node/Protocols/info', { Protocol: re.Protocol })}>查看</Button>
                            <Dropdown overlay={
                                <Menu>
                                    <Menu.Item onClick={() => downProtocol(re.Protocol)} key={1}>下载协议</Menu.Item>
                                    <Menu.Item disabled onClick={() => { }} key={2}>更新协议</Menu.Item>
                                    <Menu.Item onClick={() => deleteProtocols(re.Protocol)} key={3}>删除</Menu.Item>
                                </Menu>
                            }>
                                <MoreOutlined />
                            </Dropdown>
                        </Space>
                    }
                ] as ColumnsType<Uart.protocol>}
            >
            </Table>
        </>
    )
}

export default Protocols