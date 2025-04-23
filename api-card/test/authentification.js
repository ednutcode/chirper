process.env.NODE_ENV = 'test';

const config = require('../config');
const server = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
chai.use(chaiHttp);

describe('Authentification.js', () => {
    describe('/get POST to check authentification.js middleware', () => {
        it('should return error for missing password', (done) => {
            chai.request(server)
                .post('/get')
                .type('form')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return error for empty password', (done) => {
            chai.request(server)
                .post('/get')
                .type('form')
                .send({ password: ' ' })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return error for invalid password', (done) => {
            chai.request(server)
                .post('/get')
                .type('form')
                .send({ password: 'badpassword' })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should succeed for valid password', (done) => {
            chai.request(server)
                .post('/get')
                .type('form')
                .send({ password: config.apipassword, callSid: 'fakecallsid' })
                .end((err, res) => {
                    // Status may be 200 or 404 depending on DB, just check not 401
                    expect(res).to.not.have.status(401);
                    done();
                });
        });
    });
});