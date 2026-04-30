#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateModules(modules) {
  console.log('Validating modules:', modules);
  
  for (const module of modules) {
    const modulePath = path.join(__dirname, '..', module);
    if (!fs.existsSync(modulePath)) {
      console.error(`Module ${module} not found at ${modulePath}`);
      return false;
    }
    
    console.log(`✓ Module ${module} exists`);
  }
  
  return true;
}

function validateEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`.env file not found at ${envPath}`);
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log(`✓ .env file exists`);
  console.log('Env content:', envContent);
  
  return true;
}

function validateEvolver() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error(`package.json not found at ${packagePath}`);
    return false;
  }
  
  console.log(`✓ package.json exists`);
  
  return true;
}

function main() {
  console.log('=== Validation Suite ===');
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Basic validation
    const envOk = validateEnv();
    const evolverOk = validateEvolver();
    
    if (envOk && evolverOk) {
      console.log('✓ Validation suite passed');
      return true;
    } else {
      console.error('✗ Validation suite failed');
      return false;
    }
  } else {
    // Specific module validation
    return validateModules(args);
  }
}

if (require.main === module) {
  const result = main();
  process.exit(result ? 0 : 1);
}