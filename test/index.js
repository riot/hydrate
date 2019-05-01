import JSDOMGlobal from 'jsdom-global'
import register from '@riotjs/ssr/register'
import {expect, use} from 'chai'
import sinonChai from 'sinon-chai'
import {spy} from 'sinon'
import hydrate from '../'

describe('@riotjs/hydrate', () => {
  before(() => {
    JSDOMGlobal()
    use(sinonChai)
    register()
  })

  it('it replaces the DOM nodes properly', () => {
    const MyComponent = require('./components/my-component.riot').default
    const root = document.createElement('div')
    root.innerHTML = '<p>goodbye</p><input value="foo"/>'

    document.body.appendChild(root)
    const instance = hydrate(root, MyComponent)

    expect(instance.$('p').innerHTML).to.be.equal('goodbye')
    expect(instance.$('input').value).to.be.equal('foo')
  })

  it('it preserves riot DOM events', () => {
    const MyComponent = require('./components/my-component.riot').default
    const root = document.createElement('div')
    root.innerHTML = '<p>goodbye</p><input value="foo"/>'

    document.body.appendChild(root)
    const instance = hydrate(root, MyComponent)

    instance.$('p').onclick()

    expect(instance.$('p').innerHTML).to.be.equal(instance.state.message)
  })

  it('it preserves riot DOM events', () => {
    const MyComponent = require('./components/my-component.riot').default
    const root = document.createElement('div')
    root.innerHTML = '<p>goodbye</p><input value="foo"/>'

    const beforeSpy = spy()
    const afterSpy = spy()

    document.body.appendChild(root)

    hydrate(root, {
      ...MyComponent,
      exports: {
        ...MyComponent.exports,
        onBeforeHydrate: beforeSpy,
        onHydrated: afterSpy
      }
    })

    expect(beforeSpy).to.have.been.called
    expect(afterSpy).to.have.been.called
  })
})