import { Card } from "antd"
import { loguserrequsts } from "../../common/FecthRoot"
import { getColumnSearchProp } from "../../common/tableCommon"
import { Log, DesList } from "./log"

export const LogUserrequsts: React.FC = () => {
    return (
        <Log
            lastDay={5}
            dataFun={loguserrequsts}
            cPie={['user', 'type']}
            columns={[
                {
                    dataIndex: 'user',
                    title: 'user',
                    ...getColumnSearchProp('user')
                },
                {
                    dataIndex: 'type',
                    title: 'type'
                },
            ]}

            expandable={{
                expandedRowRender: (li: Uart.logUserRequst) =>
                    <Card>
                        <DesList title="argument" data={li.argument} />
                    </Card>
            }}
        />
    )
}


export default LogUserrequsts