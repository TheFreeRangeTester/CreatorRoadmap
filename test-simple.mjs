#!/usr/bin/env node

/**
 * Script simple para diagnosticar tests problemáticos
 */

import { execSync } from 'child_process';
import fs from 'fs';

async function runDiagnostics() {
  console.log('🔍 Diagnosticando tests problemáticos...\n');

  // 1. Verificar que los archivos existen
  const testFiles = [
    'server/__tests__/stripe-test-helpers.test.ts',
    'server/__tests__/auth.test.ts',
    'server/__tests__/storage.test.ts',
    'server/__tests__/premium-middleware.test.ts',
    'client/src/__tests__/components/idea-card.test.tsx',
    'client/src/__tests__/hooks/use-auth.test.tsx',
    'shared/__tests__/schema.test.ts',
    'shared/__tests__/simple.test.ts'
  ];

  console.log('📁 Verificando archivos de test:');
  for (const file of testFiles) {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  }

  // 2. Intentar compilar TypeScript
  console.log('\n🔧 Verificando compilación TypeScript...');
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ TypeScript compilación exitosa');
  } catch (error) {
    console.log('❌ Error de TypeScript:');
    console.log(error.stdout);
    console.log(error.stderr);
  }

  // 3. Verificar configuración Jest
  console.log('\n⚙️  Verificando configuraciones Jest...');
  const jestConfigs = ['jest.config.cjs', 'jest.config.mjs', 'jest.minimal.config.cjs'];
  for (const config of jestConfigs) {
    if (fs.existsSync(config)) {
      console.log(`  ✅ ${config} encontrado`);
    }
  }

  // 4. Intentar ejecutar un test simple con timeout
  console.log('\n🧪 Intentando ejecutar test simple...');
  try {
    const output = execSync('timeout 15s npx jest --config jest.minimal.config.cjs shared/__tests__/simple.test.ts --no-cache --no-coverage --forceExit', { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log('✅ Test simple ejecutado exitosamente:');
    console.log(output);
  } catch (error) {
    console.log('❌ Error en test simple:');
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    console.log('EXIT CODE:', error.status);
  }

  // 5. Verificar dependencias específicas
  console.log('\n📦 Verificando dependencias críticas...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const criticalDeps = ['jest', 'ts-jest', '@jest/globals', '@testing-library/jest-dom'];
    
    for (const dep of criticalDeps) {
      const hasDevDep = packageJson.devDependencies?.[dep];
      const hasDep = packageJson.dependencies?.[dep];
      console.log(`  ${hasDevDep || hasDep ? '✅' : '❌'} ${dep}`);
    }
  } catch (error) {
    console.log('❌ Error leyendo package.json:', error.message);
  }

  console.log('\n🏁 Diagnóstico completado');
}

runDiagnostics().catch(error => {
  console.error('Error en diagnóstico:', error);
  process.exit(1);
});