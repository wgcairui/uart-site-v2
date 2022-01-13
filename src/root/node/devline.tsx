import { Empty } from "antd";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TerminalMountDevNameLine } from "../../components/terminalData";


export const RootDevLine: React.FC = () => {

    const [search] = useSearchParams()

    const [props] = useState<Record<'mac' | 'pid' | 'name', string | null>>({
        mac: search.get('mac'),
        pid: search.get('pid'),
        name: search.get("name") || ''
    })

    return (
        (!props.mac || !props.pid || !props.name) ? <Empty description="请求参数不完整"></Empty>
            :
            <TerminalMountDevNameLine {...props as any}></TerminalMountDevNameLine>
    )
}