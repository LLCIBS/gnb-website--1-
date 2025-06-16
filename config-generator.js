const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Генератор конфигураций для других проектов
class ConfigGenerator {
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

  async generateConfig() {
    console.log('🛠️  Генератор конфигурации для Universal Static Generator\n');
    console.log('Ответьте на несколько вопросов для настройки генератора под ваш проект:\n');

    const config = {};

    // Основные настройки проекта
    config.projectName = await this.question('📝 Название проекта: ');
    
    // Определение структуры проекта
    const projectRoot = await this.question('📁 Путь к корню проекта (по умолчанию - текущая папка): ') || process.cwd();
    config.projectRoot = path.resolve(projectRoot);

    // Автоопределение структуры
    console.log('\n🔍 Анализ структуры проекта...');
    const detectedStructure = this.analyzeProjectStructure(config.projectRoot);
    console.log('✅ Анализ завершен\n');

    // Клиентская часть
    if (detectedStructure.hasClient) {
      config.clientDir = detectedStructure.clientDir;
      console.log(`📱 Обнаружена клиентская часть: ${config.clientDir}`);
    } else {
      config.clientDir = await this.question('📱 Директория клиентской части (например: client, src, frontend): ') || 'src';
    }

    // Серверная часть
    if (detectedStructure.hasServer) {
      config.serverDir = detectedStructure.serverDir;
      console.log(`⚙️  Обнаружена серверная часть: ${config.serverDir}`);
    } else {
      const hasServer = await this.question('⚙️  Есть ли серверная часть? (y/n): ');
      if (hasServer.toLowerCase() === 'y') {
        config.serverDir = await this.question('📁 Директория серверной части (например: server, backend, api): ') || 'server';
      }
    }

    // Команда сборки
    config.buildCommand = detectedStructure.buildCommand || 
      await this.question('🔨 Команда сборки проекта (например: npm run build): ') || 'npm run build';

    // Директория сборки
    config.distDir = detectedStructure.distDir || 
      await this.question('📦 Директория результата сборки (например: dist, build): ') || 'dist';

    // Возможности проекта
    console.log('\n🚀 Возможности проекта:');
    
    config.hasAuth = (await this.question('🔐 Есть ли система авторизации? (y/n): ')).toLowerCase() === 'y';
    config.hasAdmin = (await this.question('👨‍💼 Есть ли админ-панель? (y/n): ')).toLowerCase() === 'y';
    config.hasUploads = (await this.question('📤 Есть ли загрузка файлов? (y/n): ')).toLowerCase() === 'y';

    // Типы хостингов
    console.log('\n🌐 Типы хостингов для генерации:');
    const allTargets = ['static', 'php', 'vercel', 'netlify', 'apache', 'nginx'];
    config.targets = [];

    for (const target of allTargets) {
      const include = (await this.question(`  Включить ${target}? (y/n): `)).toLowerCase() === 'y';
      if (include) {
        config.targets.push(target);
      }
    }

    if (config.targets.length === 0) {
      console.log('⚠️  Не выбрано ни одного типа хостинга. Добавляю static по умолчанию.');
      config.targets = ['static'];
    }

    // API маршруты (если есть сервер)
    if (config.serverDir) {
      console.log('\n🛣️  API маршруты будут автоматически определены из серверного кода');
      config.apiRoutes = []; // Будут определены автоматически
    }

    // Финальные настройки
    config.outputDir = 'static-bundles';

    this.rl.close();

    return config;
  }

  analyzeProjectStructure(projectRoot) {
    const structure = {
      hasClient: false,
      hasServer: false,
      clientDir: null,
      serverDir: null,
      buildCommand: null,
      distDir: null
    };

    try {
      // Проверяем стандартные директории
      const dirs = fs.readdirSync(projectRoot, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      // Поиск клиентской части
      const clientDirs = ['client', 'src', 'frontend', 'web', 'app'];
      for (const dir of clientDirs) {
        if (dirs.includes(dir)) {
          const indexFiles = ['index.html', 'index.tsx', 'index.ts', 'index.js', 'main.tsx', 'main.ts', 'main.js'];
          const dirPath = path.join(projectRoot, dir);
          
          if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            if (indexFiles.some(file => files.includes(file))) {
              structure.hasClient = true;
              structure.clientDir = dir;
              break;
            }
          }
        }
      }

      // Поиск серверной части
      const serverDirs = ['server', 'backend', 'api', 'src/server'];
      for (const dir of serverDirs) {
        if (dirs.includes(dir) || fs.existsSync(path.join(projectRoot, dir))) {
          const serverFiles = ['index.js', 'index.ts', 'server.js', 'server.ts', 'app.js', 'app.ts'];
          const dirPath = path.join(projectRoot, dir);
          
          if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            if (serverFiles.some(file => files.includes(file))) {
              structure.hasServer = true;
              structure.serverDir = dir;
              break;
            }
          }
        }
      }

      // Анализ package.json
      const packageJsonPath = path.join(projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Определение команды сборки
        if (packageJson.scripts) {
          if (packageJson.scripts.build) {
            structure.buildCommand = 'npm run build';
          } else if (packageJson.scripts['build:client']) {
            structure.buildCommand = 'npm run build:client';
          }
        }
      }

      // Определение директории сборки
      const buildDirs = ['dist', 'build', 'out', 'public'];
      for (const dir of buildDirs) {
        if (dirs.includes(dir)) {
          structure.distDir = dir;
          break;
        }
      }

      // Проверка Vite конфигурации
      const viteConfigs = ['vite.config.js', 'vite.config.ts'];
      for (const config of viteConfigs) {
        if (fs.existsSync(path.join(projectRoot, config))) {
          if (!structure.distDir) {
            structure.distDir = 'dist';
          }
          break;
        }
      }

    } catch (error) {
      console.log(`⚠️  Ошибка при анализе проекта: ${error.message}`);
    }

    return structure;
  }

  async saveConfig(config) {
    const configPath = path.join(config.projectRoot, 'static-generator.config.js');
    
    const configContent = `// Конфигурация Universal Static Generator
// Сгенерировано автоматически ${new Date().toLocaleString('ru-RU')}

const UniversalStaticGenerator = require('./universal-static-generator');

const projectConfig = ${JSON.stringify(config, null, 2)};

async function main() {
  try {
    console.log('🚀 Запуск универсального генератора статических сборок для ${config.projectName}\\n');
    
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
    console.log('\\n🎉 Теперь вы можете использовать любую из сборок для развертывания на соответствующем хостинге!');
    
  } catch (error) {
    console.error('\\n❌ Ошибка при генерации:', error.message);
    process.exit(1);
  }
}

// Запуск генератора
if (require.main === module) {
  main();
}

module.exports = { projectConfig, main };
`;

    fs.writeFileSync(configPath, configContent);
    console.log(`\n📄 Конфигурация сохранена в: ${configPath}`);
    
    // Создаем также package.json скрипт, если его нет
    const packageJsonPath = path.join(config.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      if (!packageJson.scripts['generate-static']) {
        packageJson.scripts['generate-static'] = 'node static-generator.config.js';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('📦 Добавлен npm скрипт: npm run generate-static');
      }
    }

    return configPath;
  }

  async run() {
    try {
      const config = await this.generateConfig();
      
      console.log('\n📋 Итоговая конфигурация:');
      console.log(JSON.stringify(config, null, 2));
      
      const save = await this.question('\n💾 Сохранить конфигурацию? (y/n): ');
      if (save.toLowerCase() === 'y') {
        const configPath = await this.saveConfig(config);
        
        const runNow = await this.question('\n🚀 Запустить генератор сейчас? (y/n): ');
        if (runNow.toLowerCase() === 'y') {
          const UniversalStaticGenerator = require('./universal-static-generator');
          const generator = new UniversalStaticGenerator(config);
          await generator.generateStaticBundles();
          await generator.createArchives();
          
          console.log('\n✅ Генерация завершена!');
        } else {
          console.log(`\n👉 Для запуска используйте: node ${path.basename(configPath)}`);
          console.log('📦 Или: npm run generate-static');
        }
      }
      
    } catch (error) {
      console.error('\n❌ Ошибка:', error.message);
    } finally {
      this.rl.close();
    }
  }
}

// Запуск генератора конфигурации
if (require.main === module) {
  const configGen = new ConfigGenerator();
  configGen.run();
}

module.exports = ConfigGenerator; 