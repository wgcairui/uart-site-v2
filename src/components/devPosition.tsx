import { Marker } from "@uiw/react-amap";
import { Divider } from "antd";
import React, { useState } from "react";
import { Amap_gps2AutonaviPosition, getTerminal, V2_API_Aamp_ip2local } from "../common/Fetch";
import { AmapLoader } from "./amaploader";


interface props {
    /**
     * mac or terminal
     */
    terminal: string | Uart.Terminal
}

/**
 * 设备模糊定位
 */
export const DevPosition: React.FC<props> = ({ terminal }) => {

    const [position, setPosition] = useState<AMap.LngLat>()

    const [mh, setMh] = useState(false)

    const ready = async () => {
        try {
            const { ip, jw, name } = typeof terminal === 'string' ? (await getTerminal(terminal)).data : terminal
            const position = jw ? await Amap_gps2AutonaviPosition(jw!, window) : await V2_API_Aamp_ip2local(ip || '120.202.61.89')
            setMh(Boolean(jw))
            setPosition(position)
        } catch (error) {
            console.log(error);

        }

    }

    return (

        <>

            <Divider orientation="center" plain>{mh ? 'gps' : 'ip'}定位</Divider>

            <AmapLoader zoom={8} onComplete={() => ready()} center={position}>
                {
                    position ? <Marker position={position}></Marker> : <a />
                }
            </AmapLoader>

        </>
    )
}