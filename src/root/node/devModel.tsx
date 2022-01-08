import { Pie } from "@ant-design/charts";
import { DeleteFilled, WarningFilled } from "@ant-design/icons";
import { Button, Card, Collapse, Divider, Form, Input, message, Modal, Table } from "antd";
import React, { useMemo, useState } from "react";
import { pieConfig } from "../../common/charts";
import { addDevType, deleteDevModel, DevTypes } from "../../common/FecthRoot";
import { generateTableKey, getColumnSearchProp, tableColumnsFilter } from "../../common/tableCommon";
import { ProtocolsCascader } from "../../components/Selects";
import { usePromise } from "../../hook/usePromise";

interface props {
    ok?: () => void
}
const AddDevModel: React.FC<props> = ({ ok }) => {


    const types = {
        ups: "UPS",
        air: "空调",
        em: "电量仪",
        th: "温湿度",
        'io': "IO"
    }

    const [model, setModel] = useState('')
    const [protocol, setProtocol] = useState<[Uart.protocolType, string][]>([])



    /**
       * 添加设备类型
       */
    const addDevTypes = () => {
        const Type = protocol[0][0]
        const Protocols = protocol.map(el => el[1])

        addDevType(types[Type], model, Protocols.map(el => ({ ProtocolType: Type, Protocol: el })))
            .then((res) => {
                message.success("提交成功");
                ok && ok()
            });
    }


    return (
        <Form labelCol={{ span: 3 }}>
            <Form.Item label="设备型号">
                <Input value={model} onChange={e => setModel(e.target.value)} />
            </Form.Item>
            <Form.Item label="设备协议(多选)">
                <ProtocolsCascader onChange={(val: any[]) => setProtocol(val)} multiple></ProtocolsCascader>
            </Form.Item>
            <Form.Item>
                <Button type="primary" onClick={() => addDevTypes()}>添加</Button>
            </Form.Item>
        </Form>
    )
}

export const DevModel: React.FC = () => {

    const [fType, setType] = useState<string[]>([])
    const { data, loading, fecth } = usePromise(async () => {
        const { data } = await DevTypes()
        return data
    }, [])

    const status = useMemo(() => {
        const m = new Map<string, number>()
        data.forEach(el => {
            m.set(el.Type, (m.get(el.Type) || 0) + 1)
        })
        return [...m.entries()].map(([type, value]) => ({ type, value }))
    }, [data])


    /**
       * 删除设备类型
       */
    const deleteDevModels = (DevModel: string) => {
        Modal.confirm({
            content: `确定删除型号"${DevModel}"？？？`,
            icon: <WarningFilled />,
            onOk() {
                deleteDevModel(DevModel)
                    .then((el) => {
                        if (el.code) {
                            message.success("删除成功")
                            fecth()
                        } else {
                            Modal.warn({ content: `${el.data} 等设备还在使用此类型` })
                        }
                    });
            }
        })
    }

    return (
        <>
            <Divider orientation="left">设备类型 / {data.length}</Divider>
            <Pie data={status} renderer="canvas" {...pieConfig({ angleField: 'value', colorField: 'type', radius: .8, onClick: t => setType([t]) })} />

            <Collapse ghost>
                <Collapse.Panel header="添加设备" key="1" >
                    <Card>
                        <AddDevModel ok={fecth}></AddDevModel>
                    </Card>
                </Collapse.Panel>
            </Collapse>
            <Table loading={loading} dataSource={generateTableKey(data, "_id")} pagination={false}>
                <Table.Column dataIndex="DevModel" title="设备型号" {...getColumnSearchProp("DevModel")}></Table.Column>
                <Table.Column dataIndex="Type" title="设备类型" filteredValue={fType} {...tableColumnsFilter(data, 'Type')}></Table.Column>
                <Table.Column dataIndex="Protocols" title="协议集" render={(val: any[]) => val.map(el => el.Protocol).join(",")}></Table.Column>
                <Table.Column key="oprate" title="操作" render={(_, re: Uart.DevsType) => <>
                    <Button type="link" onClick={() => deleteDevModels(re.DevModel)} icon={<DeleteFilled />}></Button>
                </>}></Table.Column>
            </Table>
        </>
    )
}