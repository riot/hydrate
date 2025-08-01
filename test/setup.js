import JSDOMGlobal from 'jsdom-global'
import { pathToFileURL } from 'node:url'
import { register } from 'node:module'

JSDOMGlobal(false, { pretendToBeVisual: true })
register('@riotjs/register', pathToFileURL('./'))
