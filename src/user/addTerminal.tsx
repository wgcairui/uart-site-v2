import React, { useState } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Divider, Card, Form, Button, Input, message, Spin, Descriptions, Tag, Table, Modal } from "antd";
import { addUserTerminal, getTerminalOnline } from "../common/Fetch";
import { useNav } from "../hook/useNav";

const AddTerminal: React.FC = () => {

    const [ter, setTer] = useState<Uart.Terminal>()

    const nav = useNav()

    const [mac, setMac] = useState("")

    const [seachLoading, setSeachLoading] = useState(false)
    const seachTerminal = () => {
        setSeachLoading(true)
        getTerminalOnline(mac).then(el => {
            setSeachLoading(false)
            if (el.code === 200 && el.data) {
                setTer(el.data)
            } else {
                message.info({
                    content: (
                        <>
                            <p>设备未上线或未注册</p>
                            <p>如果是透传网关,请按<a href="https://www.yuque.com/wrgtwc/wgskxt/vpzoiu" target="_blank" rel="noreferrer noopener">此配置</a>设置</p>
                            <p>如果是百事服卡,请按<a href="https://www.yuque.com/wrgtwc/wgskxt/hqnevk" target="_blank" rel="noreferrer noopener">此配置</a></p>
                        </>
                    ),
                    duration: 6
                })
            }
        })
    }

    const bindTer = () => {
        const key = ter!.DevMac + ter?.ip
        addUserTerminal(ter!.DevMac).then(el => {
            if (el.code === 200) {
                message.success({
                    key,
                    content: "绑定成功"
                })
                Modal.success({
                    content: `成功绑定设备${ter?.name},是否返回主页?`,
                    onOk() {
                        nav("/")
                    }
                })
            } else {
                message.warn({
                    content: '绑定失败:' + el.msg,
                    duration: 5,
                    key
                })
            }
        })
    }

    return (
        <>
            <Breadcrumb>
                <Breadcrumb.Item href="/">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item >
                    添加设备
                </Breadcrumb.Item>
            </Breadcrumb>
            <Divider />
            <Card>
                <Form>
                    <Form.Item
                        label="设备编号"
                    >
                        <Input.Group compact>
                            <Input style={{ width: 'calc(100% - 200px)' }} onChange={val => setMac(val.target.value.replace(/( |\.|\?)/g, ''))} onPressEnter={seachTerminal} />
                            <Button type="primary" onClick={seachTerminal}>查找</Button>
                        </Input.Group>
                    </Form.Item>
                </Form>
                {
                    ter && (
                        seachLoading ?
                            <div className="center" style={{ height: 100 }}>
                                <Spin></Spin>
                            </div>
                            :
                            <section>
                                <Divider orientation="center" >{mac}</Divider>
                                <Descriptions title={ter.DevMac}>
                                    <Descriptions.Item label="名称">{ter.name}</Descriptions.Item>
                                    <Descriptions.Item label="IP">{ter.ip}</Descriptions.Item>
                                    <Descriptions.Item label="接入节点">{ter.mountNode}</Descriptions.Item>
                                    <Descriptions.Item label="启用状态">
                                        <Tag color={ter.disable ? 'yellow' : 'blue'}>{ter.disable ? '禁用' : '正常'}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="操作">
                                        <Button size="small" type="primary" onClick={bindTer}>绑定设备</Button>
                                    </Descriptions.Item>
                                </Descriptions>
                                {
                                    (ter.mountDevs && ter.mountDevs.length > 0) &&
                                    <>
                                        <Divider orientation="center">挂载设备</Divider>
                                        <Table dataSource={ter.mountDevs.map((el, key) => ({ ...el, key }))}>
                                            <Table.Column dataIndex="Type" title="类型"></Table.Column>
                                            <Table.Column dataIndex="mountDev" title="设备"></Table.Column>
                                            <Table.Column dataIndex="pid" title="地址"></Table.Column>
                                            <Table.Column dataIndex="protocol" title="协议"></Table.Column>
                                            <Table.Column dataIndex="online" title="状态"
                                                render={b => <Tag color={b ? 'blue' : 'yellow'}>{b ? '在线' : '离线'}</Tag>}></Table.Column>
                                        </Table>
                                    </>
                                }
                            </section>
                    )
                }
            </Card>
        </>
    )
}

export default AddTerminal