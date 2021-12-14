import { configureStore } from "@reduxjs/toolkit"
import { storeUser, User } from "./user"

export interface State {
    User: storeUser
}

export default configureStore<State>({
    reducer: {
        User: User.reducer
    }
})