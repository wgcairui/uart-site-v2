import { ApartmentOutlined, HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Card, Col, Descriptions, Divider, Row, Tag, Empty } from "antd";
import moment from "moment";
import React, { } from "react";
import { useParams } from "react-router-dom";
import { getTerminal } from "../common/Fetch";
import { DevPosition } from "../components/devPosition";
import { TerminalMountDevs } from "../components/terminalsTable";
import { usePromise } from "../hook/usePromise";

/**
 * 透传网关设备详情页
 * @returns 
 */
const Terminal: React.FC = () => {
    /**
     * 设备id
     */
    const { id } = useParams()

    /**
     * 透传网关
     */
    const { data: terminal, fecth } = usePromise(async () => {
        const { data } = await getTerminal(id || '')
        return data
    }, undefined, [id])

    return (
        !terminal ? <Empty />
            :
            <>
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
                <Card style={{ overflow: "auto", height: "100%",marginBottom:36 }}>
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
                            <section style={{ padding: 12 }}>
                                <Divider orientation="left">挂载设备</Divider>
                                <TerminalMountDevs terminal={terminal} ex={true} showTitle={false} col={{ md: 12 }} onChange={fecth}></TerminalMountDevs>
                            </section>
                        </Col>
                        <Col span={24} md={12}>
                            <DevPosition  terminal={terminal.DevMac}></DevPosition>
                        </Col>
                    </Row>
                </Card>
            </>
    )
}

export default Terminal