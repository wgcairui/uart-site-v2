import { Empty } from "antd";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TerminalMountDevNameLine } from "../components/terminalData";
import { useToken } from "../hook/useToken";
export const WxLine: React.FC = () => {

    const token = useToken()

    const [search] = useSearchParams()

    const props = {
        mac: search.get('mac'),
        pid: search.get('pid'),
        name: search.get("name") || ''
    }

    console.log(props, token);

    return (
        (!token || !props.mac || !props.pid || !props.name) ? <Empty description="请求参数不完整"></Empty>
            :
            <div style={{ paddingTop: 12, paddingBottom: 32, paddingLeft: 18, paddingRight: 18 }}>
                <TerminalMountDevNameLine {...props as any}></TerminalMountDevNameLine>
            </div>
    )
}