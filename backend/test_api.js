const http = require('http');
const app = require('./src/app');

function makeRequest(server, options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: server.address().port,
        ...options,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: JSON.parse(data),
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: data,
            });
          }
        });
      }
    );

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('🧪 Running Backend API Automated Verification Suite');
  console.log('==================================================');

  const server = app.listen(0);
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Health Check Endpoint
    const resHealth = await makeRequest(server, { path: '/api/health', method: 'GET' });
    assert(resHealth.statusCode === 200 && resHealth.body.success === true, 'GET /api/health returns 200 OK');

    // Test 2: Unknown Route 404 Handling
    const res404 = await makeRequest(server, { path: '/api/non-existent-route', method: 'GET' });
    assert(res404.statusCode === 404 && res404.body.success === false, 'GET /api/non-existent-route returns 404 Not Found');

    // Test 3: Protected Route Access Without Token (Projects)
    const resProjectsNoAuth = await makeRequest(server, { path: '/api/projects', method: 'GET' });
    assert(resProjectsNoAuth.statusCode === 401 && resProjectsNoAuth.body.success === false, 'GET /api/projects without token returns 401 Unauthorized');

    // Test 4: Protected Route Access Without Token (Tasks)
    const resTasksNoAuth = await makeRequest(server, { path: '/api/tasks', method: 'GET' });
    assert(resTasksNoAuth.statusCode === 401 && resTasksNoAuth.body.success === false, 'GET /api/tasks without token returns 401 Unauthorized');

    // Test 5: Protected Route Access Without Token (Dashboard Stats)
    const resStatsNoAuth = await makeRequest(server, { path: '/api/dashboard/stats', method: 'GET' });
    assert(resStatsNoAuth.statusCode === 401 && resStatsNoAuth.body.success === false, 'GET /api/dashboard/stats without token returns 401 Unauthorized');

    // Test 6: Malformed JWT Token Rejection
    const resMalformedToken = await makeRequest(server, {
      path: '/api/projects',
      method: 'GET',
      headers: { Authorization: 'Bearer this_is_an_invalid_token' },
    });
    assert(resMalformedToken.statusCode === 401 && resMalformedToken.body.message.includes('Invalid'), 'GET /api/projects with malformed token returns 401 Invalid Token');

    // Test 7: Register Validation - Missing Fields
    const resRegEmpty = await makeRequest(
      server,
      {
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {}
    );
    assert(resRegEmpty.statusCode === 400 && resRegEmpty.body.success === false, 'POST /api/auth/register rejects empty body with 400 Bad Request');

    // Test 8: Register Validation - Invalid Email & Short Password
    const resRegInvalid = await makeRequest(
      server,
      {
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { fullName: 'A', email: 'invalid-email', password: '123' }
    );
    assert(resRegInvalid.statusCode === 400 && resRegInvalid.body.errors.length >= 2, 'POST /api/auth/register validates name length, email format, and password length');

    // Test 9: Login Validation - Missing Fields
    const resLoginEmpty = await makeRequest(
      server,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {}
    );
    assert(resLoginEmpty.statusCode === 400 && resLoginEmpty.body.success === false, 'POST /api/auth/login rejects empty body with 400 Bad Request');

    // Test 10: Logout without token (should be rejected with 401)
    const resLogoutNoAuth = await makeRequest(
      server,
      {
        path: '/api/auth/logout',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    assert(resLogoutNoAuth.statusCode === 401, 'POST /api/auth/logout without token returns 401 Unauthorized');

    // Test 11: Reset Password - Missing Fields Rejection
    const resResetEmpty = await makeRequest(
      server,
      {
        path: '/api/auth/reset-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {}
    );
    assert(resResetEmpty.statusCode === 400 && resResetEmpty.body.success === false, 'POST /api/auth/reset-password rejects empty body with 400 Bad Request');

    // Test 12: Reset Password - Non-Existent Email Rejection
    const resResetNotFound = await makeRequest(
      server,
      {
        path: '/api/auth/reset-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'nonexistent_test_user_xyz@example.com', newPassword: 'newpassword123' }
    );
    assert(resResetNotFound.statusCode === 404 && resResetNotFound.body.success === false, 'POST /api/auth/reset-password returns 404 for non-existent email');

    console.log('==================================================');
    console.log(`Summary: ${passed} passed, ${failed} failed`);
    console.log('==================================================');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
  }
}

runTests();
