import React, { useEffect, useState } from "react";
import { RootMain } from "../../components/RootMain";
import { users as getUsers } from "../../common/FecthRoot"
import { Divider, Table } from "antd";
import { MehFilled, FrownFilled } from "@ant-design/icons";
import Avatar from "antd/lib/avatar/avatar";

export const User: React.FC = () => {

    const [users, setUsers] = useState<Uart.UserInfo[]>([])

    useEffect(() => {
        getUsers().then(({ data }) => {
            setUsers(data.map(el => ({ ...el, key: el.user })))
        })
    }, [])

    return (
        <RootMain>
            <Divider orientation="left">用户信息</Divider>


            <Table dataSource={users} columns={[
                {
                    dataIndex: 'online',
                    title: '状态',
                    width:60,
                    render: (val: boolean) => val ? <MehFilled style={{ color: 'green', fontSize: 24 }} /> : <FrownFilled style={{ fontSize: 24 }} />
                },
                {
                    dataIndex:'avanter',
                    title:'头像',
                    width:60,
                    render:(img?:string)=><Avatar src="img" alt="i"></Avatar>
                },
                {
                    dataIndex: 'user',
                    title: '用户名',
                    width:120
                },
                {
                    dataIndex:'name',
                    title:'昵称'
                }
            ]} />
        </RootMain>
    )
}