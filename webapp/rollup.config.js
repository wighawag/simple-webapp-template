import * as path from "path";
import * as fs from "fs";
import svelte from 'rollup-plugin-svelte';
import svelte_hot from 'rollup-plugin-svelte-hot';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image'; // TODO do not use, load image dynamically instead
import alias from '@rollup/plugin-alias'; // TODO do not use, load image dynamically instead
import replace from '@rollup/plugin-replace';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import visualizer from 'rollup-plugin-visualizer';
import sizes from "rollup-plugin-sizes";
import analyze from 'rollup-plugin-analyzer'

// NOTE The NOLLUP env variable is picked by various HMR plugins to switch
// in compat mode. You should not change its name (and set the env variable
// yourself if you launch nollup with custom comands).
const nollup = !!process.env.NOLLUP;
const watch = !!process.env.ROLLUP_WATCH;
const useLiveReload = !!process.env.LIVERELOAD;

const dev = watch || useLiveReload;
const production = !dev;

const hot = watch && !useLiveReload;


console.log({production});

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
    // TODO env
    alias({
      entries: [
        {
          find: 'contractsInfo', customResolver: (what, from) => { 
            return path.resolve(__dirname, './src/contracts/development.json')
          }
        },
      ]
    }),
		(nollup ? svelte_hot : svelte)({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file - better for performance
      css: production ? css => {
        css.write('public/build/bundle.css');
      } : false,
      hot: hot && {
        // Optimistic will try to recover from runtime
        // errors during component init
        optimistic: true,
        // Turn on to disable preservation of local component
        // state -- i.e. non exported `let` variables
        noPreserveState: false,

        // See docs of rollup-plugin-svelte-hot for all available options:
        //
        // https://github.com/rixo/rollup-plugin-svelte-hot#usage
      },
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
      // mainFields: ["module", "browser"], 
      // browser: true,
      mainFields: ["browser"], // Important 
			dedupe: ['svelte']
		}),
		commonjs(),
		json(),
		image(),
    
    production && sizes(),
    production && visualizer(),
    production && sizeSnapshot(),
    production && analyze({writeTo: function(analysisString) {
      fs.writeFileSync("./rollup.analysis", analysisString);
    {{!"}"}}}),

     // In dev mode, call `npm run start:dev` once
    // the bundle has been generated
    dev && !nollup && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    useLiveReload && livereload('public'),
    
		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}
