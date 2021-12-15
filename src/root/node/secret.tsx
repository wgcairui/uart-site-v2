import { Tabs, Form, Input, Button, Spin, message, Modal } from "antd";
import React, { useState } from "react";
import { useAsync } from "react-use";
import { get_Secret, set_Secret } from "../../common/FecthRoot";
import { MyInput } from "../../components/myInput";
import { RootMain } from "../../components/RootMain";

interface key {
    remark: string;
    type: Uart.secretType;
    text: string;
    appid?: string
    secret?: string
}

export const Secret: React.FC = () => {
    const types = [
        {
            remark: '阿里云短信平台',
            type: 'aliSms',
            text: 'aliyunSMS',
            appid: "",
            secret: ""
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
    ]

    const [tabKey, setTabKey] = useState("aliSms")

    const secret = useAsync(async () => {
        const { data } = await get_Secret(tabKey as any)

        const type = types.find(el => el.type === tabKey)!
        const { appid, secret } = data!
        return { ...type, appid: appid || '', secret: secret || '' } as Uart.Secret_app
    }, [tabKey])

    const updateSecret = (val: string, isAppId: boolean = true) => {
        const type = types.find(el => el.type === tabKey)!
        if (isAppId) type.appid = val
        else type.secret = val
    }

    const submit = () => {
        const type = types.find(el => el.type === tabKey)!
        const oldType = secret.value!

        console.log({ type, oldType });


        if (type.appid || type.secret) {
            const appid = type.appid || oldType.appid
            const secret = type.secret || oldType.secret
            Modal.confirm({
                content: `appid:${appid} \n
                         secret:${secret}`,
                onOk() {
                    set_Secret({ ...oldType, appid, secret })
                        .then(() => {
                            message.success("更新成功")
                        })
                }
            })
        } else {
            message.info('没有修改')
        }

    }

    return (
        <RootMain>
            <Tabs onChange={setTabKey}>
                {
                    types.map(type =>
                        <Tabs.TabPane key={type.type} tab={type.remark}>
                            {
                                secret.loading
                                    ? <Spin />
                                    :
                                    <Form>
                                        <Form.Item label="appId">
                                            <MyInput value={secret.value?.appid || ''} onSave={val => updateSecret(val)}></MyInput>
                                        </Form.Item>
                                        <Form.Item label="secret">
                                            <MyInput value={secret.value?.secret || ''} onSave={val => updateSecret(val, false)}></MyInput>
                                        </Form.Item>
                                    </Form>
                            }
                        </Tabs.TabPane>)
                }
            </Tabs>

            <Button type="primary" onClick={submit}>Save</Button>
        </RootMain>
    )
}