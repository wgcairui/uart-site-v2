import { LoadingOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Menu } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { userInfo } from "../common/Fetch";
import { usePromise } from "../hook/usePromise";


/**
 * 
 * @returns 
 */
export const UserDropDown: React.FC = () => {

    const nav = useNavigate()
    const exit = () => {
        localStorage.removeItem("token")
        nav("/login")
    }

    const { data, loading } = usePromise(async () => {
        const { data } = await userInfo()
        return data
    })

    const menu = <Menu>
        <Menu.Item key="userInfo" onClick={() => nav("/user")}>用户信息</Menu.Item>
        <Menu.Item key="logout" onClick={() => exit()}>退出</Menu.Item>
    </Menu>

    return (
        loading ?
            <LoadingOutlined />
            :
            //<Dropdown overlay={menu}><Avatar src={data.avanter} size="large"></Avatar> </Dropdown>
            <Button onClick={()=>exit()} type="link">exit</Button>
    )
}