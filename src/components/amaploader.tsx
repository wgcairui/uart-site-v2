
import React from "react";
import { Map, APILoader, MapProps } from "@uiw/react-amap"


/**
 * 搞的地图组件
 * @param props 
 * @returns 
 */
export const AmapLoader: React.FC<MapProps & { akay?: string, width?: string | number, height?: number | string }> = (props) => {

    return (
        <APILoader akay={props.akay || "2bbc666ac8e6a9d69c2910a7053243b6"}>
            <div style={{ width: props.width || "100%", height: props.height || 500 }}>
                <Map zoom={props.zoom || 8} onComplete={(val) => props.onComplete && props.onComplete(val)}>
                    {
                        props.children
                    }
                </Map>
            </div>
        </APILoader>
    )
}