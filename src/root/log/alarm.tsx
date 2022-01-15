import { Tag } from "antd"
import { loguartterminaldatatransfinites } from "../../common/FecthRoot"
import { getColumnSearchProp } from "../../common/tableCommon"
import { ResultDataParse } from "../../components/resultData"
import { Log } from "./log"

/**
 * 设备告警提醒
 * @returns 
 */
 export const LogUartTerminalDatatransfinites: React.FC = () => {
    return (
        <Log
            lastDay={10}
            dataFun={loguartterminaldatatransfinites}
            cfilter={['tag']}
            cPie={['mac', 'tag']}
            columns={[
                {
                    dataIndex: 'isOk',
                    title: 'isOk',
                    render: val => val ? <Tag color='green'>ok</Tag> : <Tag>未确认</Tag>,
                    width: 80
                },
                {
                    dataIndex: 'mac',
                    title: 'mac',
                    ...getColumnSearchProp('mac'),
                    width: 150
                },
                {
                    dataIndex: 'pid',
                    title: 'pid',
                    width: 60
                },
                {
                    dataIndex: 'tag',
                    title: 'tag',
                    width: 120
                },
                {
                    dataIndex: 'msg',
                    title: 'msg',
                    ...getColumnSearchProp('msg'),
                    ellipsis: true
                }
            ]}

            expandable={{
                rowExpandable: li => li.parentId,
                expandedRowRender: li => <ResultDataParse id={li.parentId} />
            }}

        />
    )
}


export default LogUartTerminalDatatransfinites