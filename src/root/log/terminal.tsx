import { Card } from "antd"
import { logterminals } from "../../common/FecthRoot"
import { getColumnSearchProp } from "../../common/tableCommon"
import { DesList, Log } from "./log"

/**
 * 设备log
 * @returns 
 */
 export const LogTerminal: React.FC = () => {
    return (
        <Log lastDay={5}
            dataFun={logterminals}
            cPie={['type', 'TerminalMac']}
            columns={[
                {
                    dataIndex: 'TerminalMac',
                    title: 'mac',
                    ...getColumnSearchProp('TerminalMac')
                },
                {
                    dataIndex: 'NodeName',
                    title: 'NodeName'
                },
                {
                    dataIndex: 'type',
                    title: '事件',
                }
            ]}

            expandable={{
                rowExpandable: (li: Uart.logTerminals) => li.query,
                expandedRowRender: (li: Uart.logTerminals) =>
                    <Card>
                        <DesList title="Query" data={li.query} />
                        <DesList title="Result" data={li.result} />
                    </Card>

            }}
        >

        </Log>
    )
}


export default LogTerminal