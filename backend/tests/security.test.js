const request = require('supertest');
const app = require('../server');

describe('Security & Middleware Tests', () => {
  describe('Security Headers', () => {
    it('should include helmet security headers', async () => {
      const res = await request(app).get('/api/health');
      
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
      expect(res.headers['x-xss-protection']).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should allow requests from configured origins', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should set correct CORS headers', async () => {
      const res = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(res.headers['access-control-allow-methods']).toBeDefined();
      expect(res.headers['access-control-allow-headers']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on auth endpoints', async () => {
      const promises = [];
      
      // Make 6 requests quickly (limit is 5)
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: `user${i}@example.com`,
              password: 'password'
            })
        );
      }

      const results = await Promise.all(promises);
      const rateLimited = results.some(res => res.status === 429);
      
      expect(rateLimited).toBe(true);
    });
  });

  describe('Input Validation & Sanitization', () => {
    it('should reject SQL injection attempts', async () => {
      const maliciousInput = "' OR '1'='1";
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: maliciousInput,
          password: maliciousInput
        });

      expect(res.status).toBe(400);
    });

    it('should sanitize XSS attempts', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: xssPayload,
          lastName: 'Test',
          email: 'xss@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should not expose sensitive error details', async () => {
      const res = await request(app)
        .get('/api/nonexistent-route');

      expect(res.status).toBe(404);
      expect(res.body).not.toContain('stack trace');
    });

    it('should handle CORS errors gracefully', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://malicious.com');

      // Should either allow or deny, but not crash
      expect([200, 403]).toContain(res.status);
    });
  });

  describe('Authentication Middleware', () => {
    it('should require authorization header for protected routes', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.status).toBe(401);
    });

    it('should reject malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'InvalidFormat');

      expect(res.status).toBe(401);
    });
  });

  describe('HTTP Methods Security', () => {
    it('should allow only specified HTTP methods', async () => {
      const res = await request(app)
        .delete('/api/products')
        .set('Authorization', 'Bearer fake-token');

      // Should either be forbidden or require valid auth
      expect([401, 403, 405]).toContain(res.status);
    });
  });

  describe('Health Check Endpoint', () => {
    it('should provide health status', async () => {
      const res = await request(app).get('/api/health');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should not be rate limited', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(request(app).get('/api/health'));
      }

      const results = await Promise.all(promises);
      const allSuccessful = results.every(res => res.status === 200);
      
      expect(allSuccessful).toBe(true);
    });
  });
});
