import { Tabs, Form, Input, Button } from "antd";
import React, { useState } from "react";
import { get_Secret } from "../../common/FecthRoot";
import { RootMain } from "../../components/RootMain";

interface key {
    remark: string;
    type: Uart.secretType;
    text: string;
    openid?: string
    secret?: string
}

export const Secret: React.FC = () => {
    const [types, setTypes] = useState<key[]>([
        {
            remark: '阿里云短信平台',
            type: 'aliSms',
            text: 'aliyunSMS'
        },
        {
            type: "mail",
            text: 'Mail',
            remark: '通用邮件平台'
        },
        {
            type: "hf",
            text: "HfIOT",
            remark: '汉枫IOT管理账号'
        },
        {
            type: 'wxopen',
            text: 'WeiXinOPEN',
            remark: '微信开放平台网站应用密匙'
        },
        {
            type: "wxmp",
            text: 'WeiXinMP',
            remark: '微信公众平台密匙'
        },
        {
            type: 'wxmpValidaton',
            text: 'WeiXinMPCode',
            remark: '微信公众号开发者接口校验Token'
        },
        {
            type: 'wxwp',
            text: "WeiXinWP",
            remark: '微信小程序密匙'
        }
    ])

    const showOpenId = (key: any) => {
        get_Secret(key).then(el => {
            const index = types.findIndex(el => el.type === key)
            const type = types[index]
            if (el.data?.appid) {
                types[index] = { ...type, ...el.data }
                setTypes(types)
            }
        })

    }

    const submit = (e: any) => {
        console.log(e);

    }
    return (
        <RootMain>
            <Tabs onChange={showOpenId}>
                {
                    types.map(type =>
                        <Tabs.TabPane key={type.type} tab={type.remark}>
                            {type.openid}
                            {type.remark}
                        </Tabs.TabPane>)
                }
            </Tabs>
        </RootMain>
    )
}