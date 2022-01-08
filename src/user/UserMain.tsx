import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dropdown, Layout, Menu, Avatar, Image } from "antd";
import "./UserMain.css"
import { Link, Outlet } from "react-router-dom";
import { universalProps } from "../typing";
import { State } from "../store";
import { setTerminals, storeUser } from "../store/user";
import { IconFont, devTypeIcon } from "../components/IconFont";
import { BindDev } from "../common/Fetch";
import { useNav } from "../hook/useNav";
import { useTerminalUpdate } from "../hook/useTerminalData";
import { subscribeEvent, unSubscribeEvent } from "../common/socket";
import { UserDropDown } from "../components/userDropDown";

/**
 * 用户侧通用页面
 * @param props 
 * @returns 
 */
export const Main: React.FC<universalProps> = (props) => {

    const nav = useNav()

    const Dispatch = useDispatch()

    const [terminals, setTer] = useState<Uart.Terminal[]>([])

    /**
     * 获取绑定设备
     * @returns 
     */
    const getBind = async () => {
        const { data } = await BindDev()
        const uts = data.UTs as any as Uart.Terminal[]
        setTer([...uts])
    }

    useEffect(() => {
        getBind()
    }, [])

    useEffect(() => {
        Dispatch(setTerminals(uts))
    }, [terminals])


    /**
     * 监听绑定设备变更
     */
    useEffect(() => {
        const lists: { event: string, pid: number }[] = []

        terminals.forEach(el => {
            const event = "MacUpdate" + el.DevMac
            const pid = subscribeEvent(event, () => getBind())
            lists.push({ event, pid })
        })
        return () => {
            lists.forEach(({ event, pid }) => {
                unSubscribeEvent(event, pid)
            })
        }
    }, [terminals])

    const uts = useMemo(() => {
        return terminals
            .map(el => (el.mountDevs || []).map(el2 => ({ ...el2, online: el.online, mac: el.DevMac, name: el.name }))).flat()
    }, [terminals])

    return (
        <main className="user-main">
            <Layout className="user-main">
                <Layout.Header className="user-header">
                    <Link to="/">
                        <Image src="http://admin.ladishb.com/upload/LADS_witdh.png" preview={false} height={20}></Image>
                    </Link>
                    <div className="user-header-menu">
                        <Menu theme="dark" mode="horizontal">
                            <Menu.SubMenu title="所有设备" key="1" icon={<IconFont type="icon-changjingguanli" />}>
                                {
                                    uts.map((el, key) => {
                                        return <Menu.Item key={'1-' + key} icon={devTypeIcon[el.Type]}>
                                            <Link to={"/dev/" + el.mac + el.pid /*new URLSearchParams({ id: el.mac + el.pid }).toString() */}>{`${el.name}-${el.mountDev}-${el.pid}`}</Link>
                                        </Menu.Item>
                                    })
                                }
                            </Menu.SubMenu>
                            <Menu.Item key="2" icon={<IconFont type="icon-tixingshixin" />} onClick={() => nav("/alarm")}>告警管理</Menu.Item>
                            <Menu.SubMenu key="4" title="languga" icon={<IconFont type="icon-zuzhiqunzu" />}>
                                <Menu.Item key="4-1">中文</Menu.Item>
                                <Menu.Item key="4-2">EN</Menu.Item>
                            </Menu.SubMenu>
                        </Menu>
                        <UserDropDown></UserDropDown>
                    </div>
                </Layout.Header>
                <Layout.Content style={{ padding: 9, height: "100%", backgroundColor: "#ffffff" }}>
                    <Outlet />
                </Layout.Content>
            </Layout>

        </main>
    )
}