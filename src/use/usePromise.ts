import React, { SetStateAction, useEffect, useState } from "react";


/**
 * 
 */
export type IusePromiseData<T> = T extends Array<infer P> ? (Record<string, any> & P)[] : T & Record<string, any> 

type data<T> = T extends Array<infer P> ? (Record<string, any> & P)[] : T & Record<string, any>


/**
 * usePromise 返回值
 */
export interface IusePromise<T> {
    /**
     * 等待结果生成
     */
    loading: boolean;
    /**
     * 数据
     * 虽然使用了extends判断,但是没有赋予初始值的话实际还是为undefine
     * ts无法判断是否有初始值
     */
    data: data<T>
    /**
     * 错误
     */
    err: any;
    /**
     * 重新请求
     */
    fecth: () => void
    setData: React.Dispatch<React.SetStateAction<data<T>>> | React.Dispatch<SetStateAction<data<T> | undefined>>
}


/**
 * 组合hook,传入promise,等待结果生成后返回
 * @param fn 传入的promise函数
 * @param deps 监听数组
 * @param initValue 默认初始值
 * @returns 
 */
export const usePromise = <T>(fn: () => Promise<T>, initValue?: data<T> | (() => data<T>), deps?: React.DependencyList): IusePromise<T> => {

    const [loading, setLoading] = useState(true)

    const [data, setData] = initValue ? useState<data<T>>(initValue) : useState<data<T>>()

    const [err, setErr] = useState<any>()

    function fecth() {
        setLoading(true)
        fn()
            .then((el: any) => setData(el))
            .catch(setErr)
            .finally(() => setLoading(false))
    }


    useEffect(() => {
        fecth()
    }, deps || [])



    return {
        loading,
        data: data as any,
        err,
        fecth,
        setData
    }
}