#!/usr/bin/env node

/**
 * IDE Test Runner for Fanlist
 * Script optimizado para ejecución desde IDEs como VS Code, WebStorm, etc.
 */

import { spawn } from 'child_process';
import path from 'path';

class IDETestRunner {
  constructor() {
    this.testProcess = null;
  }

  async runTests(options = {}) {
    const {
      coverage = false,
      watch = false,
      verbose = false,
      specific = null
    } = options;

    console.log('🧪 Fanlist IDE Test Runner');
    console.log('='.repeat(40));
    console.log(`Mode: ${watch ? 'Watch' : 'Single Run'}`);
    console.log(`Coverage: ${coverage ? 'Enabled' : 'Disabled'}`);
    console.log(`Verbose: ${verbose ? 'Enabled' : 'Disabled'}`);
    if (specific) console.log(`Filter: ${specific}`);
    console.log('='.repeat(40));

    if (coverage) {
      return this.runWithCoverage();
    } else if (watch) {
      return this.runWatchMode();
    } else {
      return this.runStandard(verbose);
    }
  }

  async runStandard(verbose = false) {
    try {
      const { execSync } = await import('child_process');
      const command = verbose ? 
        'npx tsx test-runner.mjs --verbose' : 
        'npx tsx test-runner.mjs';
      
      console.log(`Executing: ${command}\n`);
      
      const output = execSync(command, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      console.log(output);
      console.log('\n✅ Tests completed successfully');
      return true;
    } catch (error) {
      console.error('\n❌ Tests failed:');
      console.error(error.stdout || error.message);
      return false;
    }
  }

  async runWithCoverage() {
    try {
      const { execSync } = await import('child_process');
      console.log('Running tests with coverage analysis...\n');
      
      const output = execSync('npx tsx test-coverage.mjs', { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      console.log(output);
      console.log('\n✅ Tests with coverage completed');
      console.log('📄 Check coverage-report.html for detailed results');
      return true;
    } catch (error) {
      console.error('\n❌ Coverage tests failed:');
      console.error(error.stdout || error.message);
      return false;
    }
  }

  async runWatchMode() {
    console.log('🔄 Starting watch mode...');
    console.log('Press Ctrl+C to stop\n');

    const { default: chokidar } = await import('chokidar');
    
    // Archivos a observar
    const watchPaths = [
      'shared/**/*.{ts,js}',
      'server/**/*.{ts,js}',
      'client/src/**/*.{ts,tsx,js,jsx}',
      'test-runner.mjs'
    ];

    let isRunning = false;

    const runTestsDebounced = this.debounce(async () => {
      if (isRunning) return;
      
      isRunning = true;
      console.log('\n🔄 Files changed, running tests...');
      console.log('='.repeat(30));
      
      try {
        await this.runStandard();
      } catch (error) {
        console.error('Test run failed:', error.message);
      }
      
      isRunning = false;
      console.log('\n👀 Watching for changes...');
    }, 1000);

    // Ejecutar tests inicialmente
    await this.runStandard();
    console.log('\n👀 Watching for changes...');

    // Configurar watcher
    const watcher = chokidar.watch(watchPaths, {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/coverage/**'
      ],
      ignoreInitial: true
    });

    watcher.on('change', runTestsDebounced);
    watcher.on('add', runTestsDebounced);
    watcher.on('unlink', runTestsDebounced);

    // Manejar cierre limpio
    process.on('SIGINT', () => {
      console.log('\n\n👋 Stopping watch mode...');
      watcher.close();
      process.exit(0);
    });

    // Mantener el proceso vivo
    return new Promise(() => {});
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static printUsage() {
    console.log(`
🧪 Fanlist IDE Test Runner

Usage:
  node test-ide.mjs [options]

Options:
  --coverage    Run tests with coverage analysis
  --watch       Run tests in watch mode
  --verbose     Enable verbose output
  --help        Show this help message

Examples:
  node test-ide.mjs                    # Run tests once
  node test-ide.mjs --coverage         # Run with coverage
  node test-ide.mjs --watch            # Watch mode
  node test-ide.mjs --coverage --verbose # Verbose coverage

IDE Integration:
  VS Code: Add to tasks.json
  WebStorm: Configure as npm script
  Sublime: Create build system
    `);
  }
}

// Procesamiento de argumentos de línea de comandos
const args = process.argv.slice(2);
const options = {
  coverage: args.includes('--coverage'),
  watch: args.includes('--watch'),
  verbose: args.includes('--verbose'),
  help: args.includes('--help')
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  if (options.help) {
    IDETestRunner.printUsage();
  } else {
    const runner = new IDETestRunner();
    runner.runTests(options).catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
  }
}

export { IDETestRunner };