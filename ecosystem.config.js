module.exports = {
  apps: [{
    name: 'gnb-website',
    script: 'npm',
    args: 'start',
    cwd: process.cwd(),
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Логирование
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Настройки перезапуска
    min_uptime: '10s',
    max_restarts: 10,
    
    // Кластеризация (если нужна)
    // instances: 'max',
    // exec_mode: 'cluster'
  }]
} 