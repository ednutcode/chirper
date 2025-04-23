process.env.NODE_ENV = 'test';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');
const config = require('../config');
const server = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
chai.use(chaiHttp);

describe('Call.js', () => {
    beforeEach((done) => {
        db.run(`DELETE FROM calls`, done);
    });

    describe('/call POST', () => {
        it('should return error for missing post data', (done) => {
            chai.request(server)
                .post('/call')
                .type('form')
                .send({ password: config.apipassword })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return error for missing fields', (done) => {
            chai.request(server)
                .post('/call')
                .type('form')
                .send({ password: config.apipassword, to: '3312345678' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return error for missing service', (done) => {
            chai.request(server)
                .post('/call')
                .type('form')
                .send({ password: config.apipassword, to: '3312345678', user: 'test' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return error for unrecognized service', (done) => {
            chai.request(server)
                .post('/call')
                .type('form')
                .send({ password: config.apipassword, to: '3312345678', user: 'test', service: 'test' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return error for bad phone number', (done) => {
            chai.request(server)
                .post('/call')
                .type('form')
                .send({ password: config.apipassword, to: '33123', user: 'test', service: 'default' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('error');
                    done();
                });
        });

        it('should return callSid for valid request', function(done) {
            this.timeout(10000); // Allow time for real Twilio call
            chai.request(server)
                .post('/call')
                .type('form')
                .send({ password: config.apipassword, to: config.testPhone || '15304474527', user: 'test', service: 'default' })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('callSid');
                    expect(res.body).to.not.have.property('error');
                    done();
                });
        });
    });
});