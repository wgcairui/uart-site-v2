import { ApartmentOutlined, CheckCircleFilled, DeleteFilled, EditFilled, EyeFilled, HomeOutlined, WarningFilled } from "@ant-design/icons";
import { Breadcrumb, Card, Col, Descriptions, Divider, message, Modal, Popconfirm, Row, Space, Tag, Tooltip, Form, Select, Button, Cascader } from "antd";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Main } from "../components/Main";
import { State } from "../store";
import { storeUser } from "../store/user";
import { Marker } from "@uiw/react-amap"
import { Aamp_ip2local, addTerminalMountDev, Amap_gps2AutonaviPosition, delTerminalMountDev, getDevTypes } from "../common/Fetch";
import { AmapLoader } from "../components/amaploader";
import { DevCard } from "../components/devCard";
import { devTypeIcon } from "../components/IconFont";
import { DevTypesCascader } from "../components/devTypsCascader";

/**
 * 透传网关设备详情页
 * @returns 
 */
export const Terminal: React.FC = () => {

    const nav = useNavigate()

    const { terminals } = useSelector<State, storeUser>(state => state.User)

    /**
     * 设备id
     */
    const { id } = useParams()

    /**
     * 透传网关
     */
    const terminal = useMemo(() => terminals.find(el => el.DevMac === id), [terminals, id])!

    /**
     * 设备定位
     */
    const [position, setPosition] = useState<AMap.LngLat>()

    /**
     * 新的挂载
     */
    const [mountDev, setMountDev] = useState<Uart.TerminalMountDevs>({
        pid: 1,
        protocol: '',
        mountDev: '',
        Type: "UPS"
    })
    const [visible, setVisible] = useState(false)


    const pids = () => {
        const ns: number[] = []
        for (let index = 1; index < 255; index++) {
            ns.push(index)
        }
        return ns
    }



    /**
     * 等待amp加载完成
     */
    const mapReady = () => {
        if (terminal) {
            if (terminal.jw) {
                Amap_gps2AutonaviPosition(terminal.jw, window).then(data => {
                    setPosition(data)
                })
            } else {
                Aamp_ip2local(terminal!.ip!).then(data => {
                    setPosition(data)
                })
            }
        }
    }

    /**
     * 删除挂载设备
     * @param mountDev 
     */
    const delMountDev = (mountDev: Uart.TerminalMountDevs) => {
        const key = terminal.DevMac + mountDev.pid
        message.loading({ content: "正在删除", key })
        delTerminalMountDev(terminal.DevMac, mountDev.pid).then(result => {
            if (result.code === 200) {
                message.success({ content: '删除成功', key })
            } else {
                message.warn({ content: "删除失败:" + result.msg, key })
            }
        })
    }

    const postMountDev = () => {
        if (mountDev.protocol) {
            Modal.confirm({
                content: `确认添加地址[${mountDev.pid}]设备[${mountDev.mountDev}/${mountDev.protocol}]?`,
                onOk: () => {
                    const key = terminal.DevMac + mountDev.pid
                    message.loading({ content: '正在添加', key })
                    addTerminalMountDev(terminal.DevMac, mountDev).then(result => {
                        if (result.code === 200) {
                            message.success({ content: '添加成功', key })
                        } else {
                            message.warn({ content: "添加失败:" + result.msg, key })
                        }
                    })
                }
            })
        }
    }



    return (
        <Main>
            <Modal title="添加设备" visible={visible} confirmLoading={!mountDev.protocol} onCancel={() => setVisible(false)} onOk={postMountDev}>
                <Form>
                    {<Form.Item label="设备协议">
                        <DevTypesCascader onChange={([Type, mountDe, protocol]) => {
                            setMountDev({ ...mountDev, Type: Type as string, protocol: protocol as string, mountDev: mountDe as string })
                        }}></DevTypesCascader>
                    </Form.Item>}
                    <Form.Item label="设备地址">
                        <Select defaultValue={mountDev.pid} onSelect={pid => setMountDev({ ...mountDev, pid })}>
                            {
                                pids().map(n => <Select.Option value={n} key={n}>{n}</Select.Option>)

                            }
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Breadcrumb>
                <Breadcrumb.Item href="/">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item >
                    <ApartmentOutlined />
                    <span>{terminal?.name}</span>
                </Breadcrumb.Item>
            </Breadcrumb>
            <Divider />
            <Card>
                <Row>
                    <Col span={24} md={12}>
                        <Descriptions title={terminal?.name || id}>
                            <Descriptions.Item label="设备ID">{terminal?.DevMac}</Descriptions.Item>
                            <Descriptions.Item label="别名">{terminal?.name}</Descriptions.Item>
                            <Descriptions.Item label="状态">
                                <Tag color="cyan">{terminal?.online ? '在线' : '离线'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="上线时间">{moment(terminal?.uptime).format("YY-M-D H:m:s")}</Descriptions.Item>
                        </Descriptions>
                        <Button onClick={() => setVisible(true)} shape="round" type="primary">添加设备</Button>
                        <section style={{ padding: 12 }}>
                            <Divider orientation="left">挂载设备</Divider>
                            <Row>
                                {
                                    terminal?.mountDevs.map(el =>
                                        <Col span={24} md={12} key={terminal.DevMac + el.pid}>
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
                        </section>
                    </Col>
                    <Col span={24} md={12}>
                        <Divider orientation="left">{terminal?.name}模糊定位</Divider>
                        <AmapLoader zoom={8} onComplete={mapReady}>
                            {
                                position ? <Marker position={position}></Marker> : <a />
                            }
                        </AmapLoader>
                    </Col>
                </Row>
            </Card>
        </Main>
    )
}