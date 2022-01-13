import { ApartmentOutlined, CheckCircleFilled, DeleteFilled, EyeFilled, HomeOutlined, WarningFilled } from "@ant-design/icons";
import { Breadcrumb, Card, Col, Descriptions, Divider, message, Modal, Popconfirm, Row, Space, Tag, Tooltip, Form, Select, Button, Empty } from "antd";
import moment from "moment";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { State } from "../store";
import { storeUser } from "../store/user";
import { Marker } from "@uiw/react-amap"
import { Aamp_ip2local, Amap_gps2AutonaviPosition, delTerminalMountDev, getTerminal } from "../common/Fetch";
import { AmapLoader } from "../components/amaploader";
import { DevCard } from "../components/devCard";
import { devTypeIcon } from "../components/IconFont";
import { DevTypesCascader } from "../components/Selects";
import { TerminalAddMountDev } from "../components/TerminalDev";
import { DevPosition } from "../components/devPosition";
import { TerminalMountDevs } from "../components/terminalsTable";
import { usePromise } from "../hook/usePromise";

/**
 * 透传网关设备详情页
 * @returns 
 */
export const Terminal: React.FC = () => {
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
                            <section style={{ padding: 12 }}>
                                <Divider orientation="left">挂载设备</Divider>
                                <TerminalMountDevs terminal={terminal} ex={true} showTitle={false} col={{ md: 12 }} onChange={fecth}></TerminalMountDevs>
                            </section>
                        </Col>
                        <Col span={24} md={12}>
                            <DevPosition terminal={terminal.DevMac}></DevPosition>
                        </Col>
                    </Row>
                </Card>
            </>
    )
}