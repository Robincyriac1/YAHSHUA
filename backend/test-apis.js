#!/usr/bin/env node

/**
 * YAHSHUA Universal API Testing Script
 * Tests all universal renewable energy and framework APIs
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

class APITester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0
    };
  }

  log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
  }

  async testEndpoint(method, endpoint, expectedFields = []) {
    this.results.total++;
    
    try {
      const response = await axios({
        method: method.toLowerCase(),
        url: `${BASE_URL}${endpoint}`,
        timeout: 5000
      });

      // Check if response is successful
      if (response.status >= 200 && response.status < 300) {
        
        // Check if expected fields exist in response
        let fieldsCheck = true;
        if (expectedFields.length > 0 && response.data) {
          for (const field of expectedFields) {
            if (!response.data.hasOwnProperty(field)) {
              fieldsCheck = false;
              break;
            }
          }
        }

        if (fieldsCheck) {
          this.results.passed++;
          this.log(`✅ ${method} ${endpoint} - ${response.status} - ${response.data?.message || 'OK'}`, 'green');
        } else {
          this.results.failed++;
          this.log(`❌ ${method} ${endpoint} - Missing expected fields: ${expectedFields.join(', ')}`, 'red');
        }
      } else {
        this.results.failed++;
        this.log(`❌ ${method} ${endpoint} - Status: ${response.status}`, 'red');
      }
    } catch (error) {
      this.results.failed++;
      if (error.code === 'ECONNREFUSED') {
        this.log(`❌ ${method} ${endpoint} - Server not running`, 'red');
      } else if (error.response) {
        this.log(`❌ ${method} ${endpoint} - ${error.response.status}: ${error.response.statusText}`, 'red');
      } else {
        this.log(`❌ ${method} ${endpoint} - ${error.message}`, 'red');
      }
    }
  }

  async runTests() {
    this.log('\n🚀 YAHSHUA Universal API Testing Suite', 'cyan');
    this.log('=' .repeat(50), 'blue');

    // Basic Health Checks
    this.log('\n📊 Health & Basic Endpoints:', 'yellow');
    await this.testEndpoint('GET', '/', ['message']);
    await this.testEndpoint('GET', '/health', ['status', 'database']);

    // Authentication & Validation APIs
    this.log('\n🔐 Authentication & Validation:', 'yellow');
    await this.testEndpoint('GET', '/api/validate/org-slug/test-org', ['available']);
    await this.testEndpoint('GET', '/api/validate/username/testuser', ['available']);
    await this.testEndpoint('GET', '/api/validate/email/test@example.com', ['available']);

    // Universal Technology APIs
    this.log('\n🌱 Universal Technology APIs:', 'yellow');
    const techFields = ['message', 'description', 'capabilities', 'status'];
    
    await this.testEndpoint('GET', '/api/projects', techFields);
    await this.testEndpoint('GET', '/api/solar', techFields);
    await this.testEndpoint('GET', '/api/wind', techFields);
    await this.testEndpoint('GET', '/api/hydro', techFields);
    await this.testEndpoint('GET', '/api/geothermal', techFields);
    await this.testEndpoint('GET', '/api/biomass', techFields);
    await this.testEndpoint('GET', '/api/ocean', techFields);
    await this.testEndpoint('GET', '/api/hybrid', techFields);

    // Universal Framework APIs
    this.log('\n🌐 Universal Framework APIs:', 'yellow');
    const frameworkFields = ['message', 'description', 'capabilities', 'status'];
    
    await this.testEndpoint('GET', '/api/resource-assessment', frameworkFields);
    await this.testEndpoint('GET', '/api/compliance', frameworkFields);
    await this.testEndpoint('GET', '/api/financial', frameworkFields);
    await this.testEndpoint('GET', '/api/data-sources', frameworkFields);

    // User Management (basic check)
    this.log('\n👤 User Management:', 'yellow');
    await this.testEndpoint('GET', '/api/users/me');

    // Test Results Summary
    this.log('\n' + '=' .repeat(50), 'blue');
    this.log('📊 Test Results Summary:', 'cyan');
    this.log(`Total Tests: ${this.results.total}`, 'blue');
    this.log(`✅ Passed: ${this.results.passed}`, 'green');
    this.log(`❌ Failed: ${this.results.failed}`, 'red');
    
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    this.log(`📈 Success Rate: ${successRate}%`, successRate > 90 ? 'green' : successRate > 70 ? 'yellow' : 'red');

    if (this.results.failed === 0) {
      this.log('\n🎉 All tests passed! Universal API is fully operational!', 'green');
    } else {
      this.log(`\n⚠️  ${this.results.failed} test(s) failed. Check the server and endpoints.`, 'yellow');
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new APITester();
  tester.runTests().catch(console.error);
}

module.exports = APITester;
