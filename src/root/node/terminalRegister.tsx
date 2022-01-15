import { message, Divider, Form, Input, Tag, Button } from "antd"
import React, { useState, useMemo } from "react"
import { addRegisterTerminal } from "../../common/FecthRoot"
import { ModalConfirm } from "../../common/util"
import { NodesSelects } from "../../components/Selects"

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

export default TerminalAddDTU