import React, { useState } from "react";
import { getTerminal } from "../common/Fetch";
import { universalResult } from "../typing";

/**
 * 获取dtu设备
 * @param mac 
 * @returns 
 */
export const useTerminal = (mac: string | Uart.Terminal) => {

    const [terminal, setTerminal] = useState<Uart.Terminal>()

    const [loading, setLoading] = useState(true)

    const [promise, setPromise] = useState<Promise<universalResult<{
        data: Uart.Terminal;
    }>>>()

    if (typeof mac === 'string') {

        const promise = getTerminal(mac)

        setPromise(promise)

        promise.then(el => {
            setLoading(loading)
            setTerminal(el.data)
        })

    } else {
        setLoading(false)
        setTerminal(mac)
    }
    return {
        loading,
        terminal,
        promise
    }

}