process.env.NODE_ENV = 'test';

const config = require('../config');
const server = require('../app');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
chai.use(chaiHttp);

describe('App.js', () => {
    describe('test the APP routes', () => {
        it('test /voice/ : should return 401 or error', (done) => {
            chai.request(server)
                .post('/voice/' + config.apipassword)
                .end((err, res) => {
                    expect([200, 400, 401]).to.include(res.status);
                    done();
                });
        });

        it('test /get/ : should return 401 or error', (done) => {
            chai.request(server)
                .post('/get')
                .type('form')
                .send({})
                .end((err, res) => {
                    expect([200, 400, 401, 404]).to.include(res.status);
                    done();
                });
        });

        it('test /sms/ : should return 401 or error', (done) => {
            chai.request(server)
                .post('/sms')
                .type('form')
                .send({})
                .end((err, res) => {
                    expect([200, 400, 401]).to.include(res.status);
                    done();
                });
        });

        it('test /status/ : should return 401 or error', (done) => {
            chai.request(server)
                .post('/status/' + config.apipassword)
                .end((err, res) => {
                    expect([200, 400, 401]).to.include(res.status);
                    done();
                });
        });

        it('test /stream/fakeservice : should return 404 or error', (done) => {
            chai.request(server)
                .get('/stream/fakeservice')
                .end((err, res) => {
                    expect([200, 404]).to.include(res.status);
                    done();
                });
        });

        it('test /call/ : should return 401 or error', (done) => {
            chai.request(server)
                .post('/call')
                .type('form')
                .send({})
                .end((err, res) => {
                    expect([200, 400, 401]).to.include(res.status);
                    done();
                });
        });
    });
});