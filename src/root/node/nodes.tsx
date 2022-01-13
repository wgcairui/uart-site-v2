import { Button, Collapse, Divider, Form, Input, message, Modal, Table } from "antd";
import React, { useMemo, useState } from "react";
import { deleteNode, nodeRestart, Nodes as getNodes, setNode } from "../../common/FecthRoot"
import { generateTableKey, tableConfig } from "../../common/tableCommon";
import { Pie } from "@ant-design/charts";
import { pieConfig } from "../../common/charts";
import { usePromise } from "../../hook/usePromise";
import { DeleteFilled } from "@ant-design/icons";



const AddNode: React.FC<{ ok?: () => void }> = ({ ok }) => {

    const [name, setName] = useState("")
    const [ip, setIp] = useState("")
    const [port, setPort] = useState(9000)
    const [count, setCount] = useState(20000)

    const submit = () => {

        setNode(name, ip, port, count)
            .then(el => {
                if (el.code) {
                    message.success("添加节点成功")
                    ok && ok()
                }
            });
    }


    return (
        <Form labelCol={{ span: 2 }}>
            <Form.Item label="节点名称" required>
                <Input value={name} onChange={e => setName(e.target.value)}></Input>
            </Form.Item>
            <Form.Item label="节点IP" required>
                <Input value={ip} onChange={e => setIp(e.target.value)}></Input>
            </Form.Item>
            <Form.Item label="节点Port">
                <Input value={port} type="number" onChange={e => setPort(Number(e.target.value))}></Input>
            </Form.Item>
            <Form.Item label="节点IP">
                <Input value={count} type="number" onChange={e => setCount(Number(e.target.value))}></Input>
            </Form.Item>
            <Form.Item>
                <Button onClick={() => submit()}>提交</Button>
            </Form.Item>
        </Form>
    )
}

export const Nodes: React.FC = () => {

    const { data: nodes, fecth } = usePromise(async () => {
        const el = await getNodes();
        return el.data;
    }, [])

    const status = useMemo(() => {
        return nodes.map(el => ({ type: el.Name, value: el.count || 0 }))
    }, [nodes])

    const deleteNodes = (node: string) => {
        deleteNode(node)
            .then(el => {
                if (el.code) {
                    message.success("删除成功")
                    fecth()
                } else {
                    Modal.warn({
                        content: `${el.data} 等设备挂载在节点上`
                    })
                }
            });
    }


    const restart = (node: string) => {
        Modal.confirm({
            content: `确定重启节点:${node}??`,
            onOk() {
                nodeRestart(node).then(el => {
                    console.log(el);

                })
            }
        })
    }
    return (
        <>
            <Divider orientation="left">节点信息</Divider>
            <Pie data={status} {...pieConfig({ angleField: 'value', colorField: 'type', radius: .8 })} />
            <Collapse ghost>
                <Collapse.Panel header="添加节点" key="1">
                    <AddNode ok={fecth} />
                </Collapse.Panel>
            </Collapse>
            <Table dataSource={generateTableKey(nodes, "_id")} {...tableConfig}>
                <Table.Column dataIndex="Name" title="节点名称"></Table.Column>
                <Table.Column dataIndex="IP" title="节点IP"></Table.Column>
                <Table.Column dataIndex="Port" title="节点端口"></Table.Column>
                <Table.Column dataIndex="MaxConnections" title="最大连接数"></Table.Column>
                <Table.Column dataIndex="count" title="注册设备"></Table.Column>
                <Table.Column dataIndex="online" title="在线设备"></Table.Column>
                <Table.Column key="oprate" title="操作" render={(_, re: Uart.NodeClient) => <>
                    {
                        re.count === 0 && <Button type="link" icon={<DeleteFilled></DeleteFilled>} onClick={() => deleteNodes(re.Name)}></Button>
                    }
                    <Button type="link" onClick={() => restart(re.Name)}>重启</Button>
                </>}></Table.Column>
            </Table>
        </>
    )
}