import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Breadcrumb, Empty, Dropdown, Button, Menu } from "antd";
import { useParams } from "react-router-dom";
import { State } from "../store";
import { storeUser } from "../store/user";
import { ApartmentOutlined, DownOutlined, HomeOutlined } from '@ant-design/icons';
import { TerminalDevPage } from "../components/TerminalDev";
import { useNav } from "../hook/useNav";

export const Dev: React.FC = () => {

    const nav = useNav()

    const { terminals, user } = useSelector<State, storeUser>(state => state.User)

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

    return (
        (!terminal || !mountDev) ? <Empty />
            :
            <>
                <Breadcrumb>
                    <Breadcrumb.Item href="/">
                        <HomeOutlined />
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Dropdown overlay={
                            <Menu>
                                {
                                    terminals.map(({ DevMac, name }) => <Menu.Item key={DevMac}>
                                        <Button type="link" onClick={() => nav('/main/terminal/' + DevMac)}>{name}</Button>
                                    </Menu.Item>)
                                }
                            </Menu>
                        }>
                            <a onClick={e => e.preventDefault()}>
                                <ApartmentOutlined style={{ marginRight: 12 }} />
                                {terminal.name}
                                <DownOutlined />
                            </a>
                        </Dropdown>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Dropdown overlay={
                            <Menu>
                                {
                                    terminal.mountDevs.map(({ mountDev, pid }) => <Menu.Item key={pid}>
                                        <Button type="link" onClick={() => nav('/main/dev/' + terminal.DevMac + pid)}>{mountDev}</Button>
                                    </Menu.Item>)
                                }
                            </Menu>
                        }>
                            <a onClick={e => e.preventDefault()}>
                                {mountDev?.mountDev}
                                <DownOutlined />
                            </a>
                        </Dropdown>
                    </Breadcrumb.Item>
                </Breadcrumb>
                <section style={{ padding: 16 }}>
                    <TerminalDevPage mac={terminal.DevMac} pid={mountDev.pid} user={user?.user}></TerminalDevPage>
                </section>

            </>
    )
}