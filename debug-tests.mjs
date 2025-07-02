#!/usr/bin/env node

/**
 * Script de debug específico para identificar tests que fallan en diferentes entornos
 */

import { execSync } from 'child_process';
import fs from 'fs';

class TestDebugger {
  constructor() {
    this.results = {
      environment: {},
      moduleTests: {},
      individual: {}
    };
  }

  async runDiagnostics() {
    console.log('🔍 Debug de Tests - Fanlist');
    console.log('='.repeat(50));
    
    // 1. Información del entorno
    await this.checkEnvironment();
    
    // 2. Verificar módulos individuales
    await this.testIndividualModules();
    
    // 3. Ejecutar tests paso a paso
    await this.runStepByStepTests();
    
    // 4. Reporte final
    this.generateReport();
  }

  async checkEnvironment() {
    console.log('\n📊 Información del Entorno:');
    
    try {
      this.results.environment.node = process.version;
      this.results.environment.platform = process.platform;
      this.results.environment.arch = process.arch;
      this.results.environment.cwd = process.cwd();
      
      console.log(`   Node.js: ${this.results.environment.node}`);
      console.log(`   Platform: ${this.results.environment.platform}`);
      console.log(`   Architecture: ${this.results.environment.arch}`);
      console.log(`   Directory: ${this.results.environment.cwd}`);
      
      // Verificar variables de entorno críticas
      const envVars = ['NODE_ENV', 'DATABASE_URL'];
      for (const env of envVars) {
        const value = process.env[env] ? 'SET' : 'NOT SET';
        console.log(`   ${env}: ${value}`);
      }
      
    } catch (error) {
      console.log('   ❌ Error obteniendo info del entorno:', error.message);
    }
  }

  async testIndividualModules() {
    console.log('\n🧩 Verificando Módulos Individuales:');
    
    const modules = [
      'shared/schema.ts',
      'shared/premium-utils.ts', 
      'server/storage.ts',
      'server/services/tokenService.ts',
      'server/services/emailService.ts'
    ];

    for (const module of modules) {
      try {
        console.log(`   Probando ${module}...`);
        
        // Intentar importar cada módulo
        const imported = await import(`./${module}`);
        console.log(`   ✅ ${module} - Importado correctamente`);
        this.results.moduleTests[module] = 'SUCCESS';
        
      } catch (error) {
        console.log(`   ❌ ${module} - Error: ${error.message}`);
        this.results.moduleTests[module] = error.message;
      }
    }
  }

  async runStepByStepTests() {
    console.log('\n🔬 Ejecutando Tests Paso a Paso:');
    
    const testCategories = [
      'Schema Tests',
      'Storage Tests', 
      'Service Tests',
      'Premium Utils Tests',
      'Middleware Tests'
    ];

    for (const category of testCategories) {
      try {
        console.log(`\n   📋 ${category}:`);
        
        // Crear un test-runner temporal que solo ejecute esta categoría
        const tempTest = this.createCategoryTest(category);
        
        // Ejecutar y capturar resultado
        const result = await this.runCategoryTest(tempTest);
        
        if (result.success) {
          console.log(`      ✅ ${category} - ${result.count} tests pasaron`);
          this.results.individual[category] = 'SUCCESS';
        } else {
          console.log(`      ❌ ${category} - Error: ${result.error}`);
          this.results.individual[category] = result.error;
        }
        
      } catch (error) {
        console.log(`      ❌ ${category} - Excepción: ${error.message}`);
        this.results.individual[category] = error.message;
      }
    }
  }

  createCategoryTest(category) {
    // Crear código de test simplificado para cada categoría
    const templates = {
      'Schema Tests': `
        import { userRegistrationSchema } from './shared/schema.js';
        console.log('Schema test OK');
      `,
      'Storage Tests': `
        import { MemStorage } from './server/storage.js';
        const storage = new MemStorage();
        console.log('Storage test OK');
      `,
      'Service Tests': `
        import { TokenService } from './server/services/tokenService.js';
        console.log('Service test OK');
      `,
      'Premium Utils Tests': `
        import { hasActivePremiumAccess } from './shared/premium-utils.js';
        console.log('Premium Utils test OK');
      `,
      'Middleware Tests': `
        console.log('Middleware test OK');
      `
    };
    
    return templates[category] || 'console.log("Test OK");';
  }

  async runCategoryTest(testCode) {
    try {
      // Crear archivo temporal
      const tempFile = 'temp-test.mjs';
      fs.writeFileSync(tempFile, testCode);
      
      // Ejecutar
      const output = execSync(`node ${tempFile}`, { 
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 5000
      });
      
      // Limpiar
      fs.unlinkSync(tempFile);
      
      return { success: true, count: 1, output };
      
    } catch (error) {
      // Limpiar archivo si existe
      try { fs.unlinkSync('temp-test.mjs'); } catch {}
      
      return { 
        success: false, 
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      };
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📋 REPORTE FINAL DE DEBUG');
    console.log('='.repeat(50));
    
    console.log('\n🌍 Entorno:');
    console.log(`   Node.js: ${this.results.environment.node}`);
    console.log(`   Plataforma: ${this.results.environment.platform}`);
    
    console.log('\n🧩 Módulos:');
    for (const [module, result] of Object.entries(this.results.moduleTests)) {
      const status = result === 'SUCCESS' ? '✅' : '❌';
      console.log(`   ${status} ${module}`);
      if (result !== 'SUCCESS') {
        console.log(`      Error: ${result}`);
      }
    }
    
    console.log('\n🔬 Tests por Categoría:');
    for (const [category, result] of Object.entries(this.results.individual)) {
      const status = result === 'SUCCESS' ? '✅' : '❌';
      console.log(`   ${status} ${category}`);
      if (result !== 'SUCCESS') {
        console.log(`      Error: ${result}`);
      }
    }
    
    console.log('\n💡 Recomendaciones:');
    
    // Analizar resultados y dar recomendaciones
    const moduleErrors = Object.values(this.results.moduleTests).filter(r => r !== 'SUCCESS');
    const testErrors = Object.values(this.results.individual).filter(r => r !== 'SUCCESS');
    
    if (moduleErrors.length === 0 && testErrors.length === 0) {
      console.log('   🎉 Todo parece estar funcionando correctamente');
      console.log('   📝 El problema puede estar en la sincronización de contadores');
    } else if (moduleErrors.length > 0) {
      console.log('   🔧 Hay problemas con la importación de módulos');
      console.log('   💡 Verifica las rutas de importación y dependencias');
    } else {
      console.log('   🧪 Los módulos cargan bien pero hay problemas en la ejecución');
      console.log('   💡 Revisa la lógica de los tests individuales');
    }
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const testDebugger = new TestDebugger();
  testDebugger.runDiagnostics().catch(error => {
    console.error('Error en debug:', error);
    process.exit(1);
  });
}