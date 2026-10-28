import { loginHandler } from './login'
import { registerHandler } from './register'
import { logoutHandler, sessionHandler } from './session'

export const authHandlers = [registerHandler, loginHandler, sessionHandler, logoutHandler]
