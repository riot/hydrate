import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'index.next.js',
  plugins: [
    resolve({
      jsnext: true
    })
  ],
  external: ['riot'],
  output: [
    {
      name: 'hydrate',
      file: 'hydrate.js',
      globals: {
        riot: 'riot'
      },
      format: 'umd'
    }
  ]
}