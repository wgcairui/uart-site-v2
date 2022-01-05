import React, { useState } from "react";
import { getDevTypes } from "../common/Fetch";
import { Cascader } from "antd";

interface DataNode {
    label: React.ReactNode;
    /** Customize hover title */
    title?: string;
    value: string | number;
    disabled?: boolean;
    children?: DataNode[];
    isLeaf?: boolean;
}

/**
 * 通用设备级联选择模板
 * @param props 
 * @returns 
 */
export const DevTypesCascader: React.FC<{ "onChange": (value: React.Key[], selectOptions: DataNode[]) => void }> = props => {

    const [cascader, setCascader] = useState<DataNode[]>([
        { value: 'UPS', label: "UPS", isLeaf: false, },
        { value: '空调', label: "空调", isLeaf: false, },
        { value: '电量仪', label: "电量仪", isLeaf: false, },
        { value: '温湿度', label: "温湿度", isLeaf: false, },
        { value: 'IO', label: "IO", isLeaf: false, },
    ])

    const loadData = (opts: DataNode[]) => {
        if (opts.length === 1) {
            const target = opts[opts.length - 1];
            (target as any).loading = true
            getDevTypes(target.value as string).then(el => {
                (target as any).loading = false
                target.children = el.data.map(type => ({
                    value: type.DevModel,
                    label: type.DevModel,
                    children: type.Protocols.map(p => ({
                        value: p.Protocol,
                        label: p.Protocol,
                    }))
                }))
                setCascader([...cascader])
            })
        }
    }

    return (
        <Cascader options={cascader} loadData={loadData} onChange={props.onChange} />
    )
}