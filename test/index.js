import { expect, use } from 'chai'
import JSDOMGlobal from 'jsdom-global'
import hydrate from '../index.js'
import sinonChai from 'sinon-chai'
import { spy } from 'sinon'
import MyComponent from './components/my-component.riot'
import WithLoops from './components/with-loops.riot'

describe('@riotjs/hydrate', () => {
  before(() => {
    JSDOMGlobal(false, { pretendToBeVisual: true })
    use(sinonChai)
  })

  it('it replaces the DOM nodes properly', (done) => {
    const root = document.createElement('div')
    root.innerHTML = '<p>goodbye</p><input value="foo"/>'

    document.body.appendChild(root)
    root.querySelector('input').focus()

    expect(document.activeElement === root.querySelector('input')).to.be.ok

    const instance = hydrate(MyComponent)(root)

    expect(instance.$('p').innerHTML).to.be.equal('hello')
    expect(instance.$('input').value).to.be.equal('foo')

    window.requestAnimationFrame(() => {
      expect(document.activeElement === instance.$('input')).to.be.ok
      done()
    })
  })

  it('it preserves riot DOM events', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p>goodbye</p><input value="foo"/>'

    document.body.appendChild(root)
    const instance = hydrate(MyComponent)(root)

    instance.$('p').click()

    expect(instance.$('p').innerHTML).to.be.equal(instance.state.message)
  })

  it('it triggers the hydrate events', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p>goodbye</p><input value="foo"/>'

    const beforeSpy = spy()
    const afterSpy = spy()

    document.body.appendChild(root)

    hydrate({
      ...MyComponent,
      exports: {
        ...MyComponent.exports,
        onBeforeHydrate: beforeSpy,
        onHydrated: afterSpy,
      },
    })(root)

    expect(beforeSpy).to.have.been.called
    expect(afterSpy).to.have.been.called
  })

  it('it works with loops', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h2>With Loops</h2><div></div>'

    document.body.appendChild(root)
    const instance = hydrate(WithLoops)(root)

    instance.insertItems()
    expect(instance.$$('p')).to.have.length(5)

    instance.insertNestedItems()
    expect(instance.$$('span')).to.have.length(5)
  })
})
