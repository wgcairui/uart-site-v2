import { createSlice } from "@reduxjs/toolkit"

export interface storeUser {
    user: Partial<Uart.UserInfo>,
    terminals: Uart.Terminal[]
}

export const User = createSlice({
    name: "user",
    initialState: {
        user: {},
        terminals: []
    } as storeUser,
    reducers: {
        setUser(state, data) {
            state.user = data.payload
        },
        setTerminals(state, data) {
            state.terminals = data.payload
        }
    }
})


export const { setUser,setTerminals } = User.actions
