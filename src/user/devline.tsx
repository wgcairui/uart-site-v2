import { ApartmentOutlined, HomeOutlined } from "@ant-design/icons";
import { Breadcrumb, Card, Empty, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { devTypeIcon } from "../components/IconFont";
import { State } from "../store";
import { storeUser } from "../store/user";
import { TerminalMountDevNameLine } from "../components/terminalData";

const DevLine: React.FC = () => {

    const { terminals } = useSelector<State, storeUser>(state => state.User)

    const [terminal, setTerminal] = useState<Uart.Terminal>()

    const [mountDev, setMountDev] = useState<Uart.TerminalMountDevs>()

    /**
     * 设备id
     */
    const { id } = useParams()

    useEffect(() => {
        const ter = terminals.find(el => RegExp("^" + el.DevMac).test(id || ''))
        if (ter) {
            setTerminal(ter)
            setMountDev(ter.mountDevs.find(el => ter.DevMac + el.pid === id))
        }
    }, [id, terminals])

    const [search] = useSearchParams()

    return (
        (!terminal || !mountDev) ? <Empty />
            : <>
                <Breadcrumb>
                    <Breadcrumb.Item href="/">
                        <HomeOutlined />
                    </Breadcrumb.Item>
                    <Breadcrumb.Item href={'/terminal/' + terminal?.DevMac}>
                        <ApartmentOutlined />
                        <span>{terminal?.name}</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item href={'/dev/' + id}>
                        {mountDev ? devTypeIcon[mountDev!.Type] : <Spin />}
                        <span>{mountDev?.mountDev || ''}</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {search.get("name") || ''}
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Card>
                    <TerminalMountDevNameLine mac={terminal.DevMac} pid={mountDev.pid} name={search.get("name") || ''}></TerminalMountDevNameLine>
                </Card>
            </>
    )
}


export default DevLine