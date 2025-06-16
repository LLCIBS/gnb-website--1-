#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Быстрая настройка Universal Static Generator для нового проекта
class QuickSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async question(query) {
    return new Promise(resolve => {
      this.rl.question(query, resolve);
    });
  }

  async run() {
    console.log('🚀 Быстрая настройка Universal Static Generator\n');
    
    // Проверяем, что файлы генератора есть
    const requiredFiles = [
      'universal-static-generator.cjs',
      'config-generator.js'
    ];

    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      console.log('❌ Отсутствуют файлы генератора:');
      missingFiles.forEach(file => console.log(`   - ${file}`));
      console.log('\nСкопируйте файлы генератора из основного проекта:');
      console.log('cp /path/to/ostie-praktika/universal-static-generator.cjs ./');
      console.log('cp /path/to/ostie-praktika/config-generator.js ./');
      this.rl.close();
      return;
    }

    console.log('✅ Файлы генератора найдены');
    console.log('\nВыберите способ настройки:');
    console.log('1. Интерактивная настройка (рекомендуется)');
    console.log('2. Быстрая настройка с базовыми параметрами');
    console.log('3. Создать только базовый файл конфигурации');

    const choice = await this.question('\nВведите номер (1-3): ');

    switch (choice) {
      case '1':
        await this.interactiveSetup();
        break;
      case '2':
        await this.quickSetup();
        break;
      case '3':
        await this.createBaseConfig();
        break;
      default:
        console.log('Неверный выбор. Запустите скрипт заново.');
    }

    this.rl.close();
  }

  async interactiveSetup() {
    console.log('\n🛠️ Запуск интерактивной настройки...\n');
    
    // Запускаем config-generator
    const { spawn } = require('child_process');
    const configProcess = spawn('node', ['config-generator.js'], { 
      stdio: 'inherit' 
    });

    configProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Интерактивная настройка завершена!');
        console.log('Запустите: npm run generate-static');
      } else {
        console.log('\n❌ Ошибка в интерактивной настройке');
      }
    });
  }

  async quickSetup() {
    console.log('\n⚡ Быстрая настройка...\n');

    // Определяем тип проекта автоматически
    const projectType = this.detectProjectType();
    const projectName = path.basename(process.cwd());

    console.log(`🔍 Обнаружен тип проекта: ${projectType}`);
    console.log(`📝 Название проекта: ${projectName}`);

    const config = this.getConfigForProjectType(projectType, projectName);
    
    const configContent = this.generateConfigFile(config);
    fs.writeFileSync('static-generator.config.js', configContent);

    // Обновляем package.json
    this.updatePackageJson();

    console.log('\n✅ Быстрая настройка завершена!');
    console.log('\n📁 Созданы файлы:');
    console.log('   - static-generator.config.js');
    console.log('\n🚀 Для запуска используйте:');
    console.log('   npm run generate-static');
    console.log('   или: node static-generator.config.js');
  }

  async createBaseConfig() {
    console.log('\n📄 Создание базового файла конфигурации...\n');

    const projectName = await this.question('Название проекта: ') || path.basename(process.cwd());
    
    const config = {
      projectName,
      projectRoot: '__dirname',
      targets: ['static', 'php'],
      hasAuth: false,
      hasAdmin: false,
      hasUploads: false,
      buildCommand: 'npm run build'
    };

    const configContent = this.generateConfigFile(config);
    fs.writeFileSync('static-generator.config.js', configContent);

    console.log('✅ Создан файл: static-generator.config.js');
    console.log('\n📝 Отредактируйте файл под ваш проект и запустите:');
    console.log('   node static-generator.config.js');
  }

  detectProjectType() {
    // Проверяем package.json
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
        if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
          return 'nextjs';
        }
        return 'react';
      }
      
      if (packageJson.dependencies?.vue || packageJson.devDependencies?.vue) {
        return 'vue';
      }
      
      if (packageJson.dependencies?.['@angular/core'] || packageJson.devDependencies?.['@angular/core']) {
        return 'angular';
      }
      
      if (packageJson.dependencies?.svelte || packageJson.devDependencies?.svelte) {
        return 'svelte';
      }
    }

    // Проверяем конфигурационные файлы
    if (fs.existsSync('vite.config.js') || fs.existsSync('vite.config.ts')) {
      return 'vite';
    }
    
    if (fs.existsSync('webpack.config.js')) {
      return 'webpack';
    }

    if (fs.existsSync('angular.json')) {
      return 'angular';
    }

    // Проверяем структуру папок
    if (fs.existsSync('src') && fs.existsSync('public')) {
      return 'spa';
    }

    return 'unknown';
  }

  getConfigForProjectType(type, projectName) {
    const configs = {
      react: {
        projectName,
        clientDir: 'src',
        distDir: 'dist',
        targets: ['static', 'vercel', 'netlify'],
        buildCommand: 'npm run build',
        hasAuth: false,
        hasAdmin: false,
        hasUploads: false
      },

      vue: {
        projectName,
        clientDir: 'src',
        distDir: 'dist',
        targets: ['static', 'php', 'netlify'],
        buildCommand: 'npm run build',
        hasAuth: false,
        hasAdmin: false,
        hasUploads: false
      },

      angular: {
        projectName,
        clientDir: 'src',
        distDir: `dist/${projectName.toLowerCase()}`,
        targets: ['static', 'nginx'],
        buildCommand: 'ng build --configuration production',
        hasAuth: false,
        hasAdmin: false,
        hasUploads: false
      },

      nextjs: {
        projectName,
        clientDir: '.',
        distDir: 'out',
        targets: ['static', 'vercel'],
        buildCommand: 'next build && next export',
        hasAuth: false,
        hasAdmin: false,
        hasUploads: false
      },

      svelte: {
        projectName,
        clientDir: 'src',
        distDir: 'dist',
        targets: ['static', 'netlify'],
        buildCommand: 'npm run build',
        hasAuth: false,
        hasAdmin: false,
        hasUploads: false
      },

      vite: {
        projectName,
        clientDir: 'src',
        distDir: 'dist',
        targets: ['static', 'vercel', 'netlify'],
        buildCommand: 'npm run build',
        hasAuth: false,
        hasAdmin: false,
        hasUploads: false
      },

      spa: {
        projectName,
        clientDir: 'src',
        distDir: 'build',
        targets: ['static', 'php'],
        buildCommand: 'npm run build',
        hasAuth: false,
        hasAdmin: false,
        hasUploads: false
      },

      unknown: {
        projectName,
        clientDir: 'src',
        distDir: 'dist',
        targets: ['static'],
        buildCommand: 'npm run build',
        hasAuth: false,
        hasAdmin: false,
        hasUploads: false
      }
    };

    return configs[type] || configs.unknown;
  }

  generateConfigFile(config) {
    return `const UniversalStaticGenerator = require('./universal-static-generator.cjs');

// Конфигурация для ${config.projectName}
const projectConfig = {
  // Основные настройки
  projectName: '${config.projectName}',
  projectRoot: __dirname,
  
  // Структура проекта
  clientDir: '${config.clientDir}',
  ${config.serverDir ? `serverDir: '${config.serverDir}',` : ''}
  distDir: '${config.distDir}',
  outputDir: 'static-bundles',
  
  // Типы хостингов для генерации
  targets: ${JSON.stringify(config.targets, null, 2).replace(/\n/g, '\n  ')},
  
  // Возможности проекта
  hasAuth: ${config.hasAuth},
  hasAdmin: ${config.hasAdmin},
  hasUploads: ${config.hasUploads},
  
  // Команда сборки
  buildCommand: '${config.buildCommand}'
};

async function main() {
  try {
    console.log('🚀 Запуск универсального генератора для ${config.projectName}\\n');
    
    const generator = new UniversalStaticGenerator(projectConfig);
    
    // Генерируем все сборки
    await generator.generateStaticBundles();
    
    // Создаем архивы
    await generator.createArchives();
    
    console.log('\\n✅ Генерация завершена успешно!');
    console.log('\\n📦 Созданные сборки:');
    
    projectConfig.targets.forEach(target => {
      console.log(\`  - \${target}: static-bundles/\${target}/\`);
    });
    
    console.log('\\n📚 Документация: static-bundles/_docs/');
    console.log('\\n🎉 Готово к развертыванию!');
    
  } catch (error) {
    console.error('\\n❌ Ошибка при генерации:', error.message);
    process.exit(1);
  }
}

// Запуск генератора
if (require.main === module) {
  main();
}

module.exports = { projectConfig, main };`;
  }

  updatePackageJson() {
    if (!fs.existsSync('package.json')) return;

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      if (!packageJson.scripts['generate-static']) {
        packageJson.scripts['generate-static'] = 'node static-generator.config.js';
        packageJson.scripts['build:static'] = 'npm run build && npm run generate-static';
        
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ Добавлены npm скрипты в package.json');
      }
    } catch (error) {
      console.log('⚠️ Не удалось обновить package.json:', error.message);
    }
  }
}

// Запуск quick-setup
if (require.main === module) {
  const setup = new QuickSetup();
  setup.run().catch(console.error);
}

module.exports = QuickSetup;