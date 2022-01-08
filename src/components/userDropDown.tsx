import { LoadingOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu } from "antd";
import React, { useEffect } from "react";
import { userInfo } from "../common/Fetch";
import { socketClient } from "../common/socket";
import { useNav } from "../hook/useNav";
import { usePromise } from "../hook/usePromise";


/**
 * 
 * @returns 
 */
export const UserDropDown: React.FC = () => {

    const nav = useNav()
    const exit = () => {
        localStorage.removeItem("token")
        nav("/")
    }

    const { data, loading } = usePromise(async () => {
        const { data } = await userInfo()
        return data
    })

    useEffect(() => {
        if (data) {
            socketClient.connect(data.user)
        }
        return () => socketClient.disConnect()
    }, [data])

    const menu = (
        <Menu>
            <Menu.Item onClick={() => nav("/root/node/user/userInfo", { user: data.user })} key="info">
                用户信息
            </Menu.Item>

            <Menu.Item onClick={() => exit()} key="exit">
                退出
            </Menu.Item>
        </Menu>
    );


    return (
        loading ?
            <LoadingOutlined />
            :
            <Dropdown overlay={menu} arrow destroyPopupOnHide placement="bottomLeft">
                <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                    <Avatar src={data.avanter} ></Avatar>
                </a>
            </Dropdown>
    )
}