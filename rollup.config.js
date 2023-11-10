import { nodeResolve } from '@rollup/plugin-node-resolve'

const globals = {
  riot: 'riot',
}

export default {
  input: 'src/index.js',
  plugins: [nodeResolve()],
  output: [
    {
      name: 'hydrate',
      file: 'index.cjs',
      format: 'umd',
      globals,
    },
    {
      name: 'hydrate',
      file: 'index.js',
      format: 'es',
      globals,
    },
  ],
  external: ['riot'],
}
